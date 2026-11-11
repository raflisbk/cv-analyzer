"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkspaceView } from "@/components/app-workspace/workspace-header";
import type { WorkspaceTab } from "@/components/app-workspace/workspace-panel";

const validViews: WorkspaceView[] = ["editor", "pdf", "report"];
const validTabs: WorkspaceTab[] = [
  "report",
  "fixes",
  "ats",
  "match",
  "grammar",
  "history",
  "chat",
];

export function useAppWorkspaceNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const viewParam = search.get("view") as WorkspaceView;
  const tabParam = search.get("tab") as WorkspaceTab;
  const view = validViews.includes(viewParam) ? viewParam : "editor";
  const tab = validTabs.includes(tabParam) ? tabParam : "report";
  function navigate(key: "view" | "tab", value: string) {
    const next = new URLSearchParams(search.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }
  return { view, tab, navigate };
}
