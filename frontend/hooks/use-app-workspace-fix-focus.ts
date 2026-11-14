"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import { showWorkspaceAnchor } from "@/lib/app-workspace/show-anchor";

export function useAppWorkspaceFixFocus(view: string, fixes: WorkspaceFix[]) {
  const search = useSearchParams();
  const index = search.get("fixIndex");
  const section = search.get("section");
  useEffect(() => {
    if (view !== "editor" || (index === null && !section)) return;
    const fix = index !== null ? fixes[Number(index)] : undefined;
    if (index !== null && (!fix || !/^\d+$/.test(index))) return;
    const focus = () => {
      const target = fix
        ? document.querySelector(`[data-fix-id="${CSS.escape(fix.id)}"]`)
        : [...document.querySelectorAll(".tiptap h2")].find(
            (item) =>
              item.textContent?.trim().toLowerCase() === section?.toLowerCase(),
          );
      if (!target) return false;
      showWorkspaceAnchor(fix?.id ?? "", section ?? fix?.section);
      return true;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [view, fixes, index, section]);
}
