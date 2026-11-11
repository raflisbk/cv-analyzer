"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasMoreContent,
  nextScrollTop,
} from "@/lib/app-workspace/scroll-assist";

export function useAppWorkspaceScrollAssist(
  ref: React.RefObject<HTMLElement | null>,
  key: string,
) {
  const [hasMore, setHasMore] = useState(false);
  const update = useCallback(() => {
    if (ref.current) {
      setHasMore(hasMoreContent(ref.current));
    }
  }, [ref]);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    node.scrollTop = 0;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    node.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
    };
  }, [ref, key, update]);

  const scrollMore = () => {
    const node = ref.current;
    if (node) {
      node.scrollTo({ top: nextScrollTop(node), behavior: "smooth" });
    }
  };
  return { hasMore, scrollMore, update };
}
