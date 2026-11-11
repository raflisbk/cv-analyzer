"use client";

import { useEffect, useRef, useState } from "react";

export function useAppWorkspacePdfWidth(view: string) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(600);
  useEffect(() => {
    const node = pdfRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(() => setPageWidth(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [view]);
  return { pdfRef, pageWidth };
}
