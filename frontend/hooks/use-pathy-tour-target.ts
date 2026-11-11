"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TourStep } from "@/lib/pathy/tours";
import { listCvs } from "@/lib/app-api/cvs";

async function tourPath(path: string): Promise<string> {
  if (!path.includes(":jobId")) {
    return path;
  }
  const cvs = await listCvs().catch(() => []);
  return cvs[0]
    ? path.replace(":jobId", encodeURIComponent(cvs[0].jobId))
    : "/app/cvs";
}

function waitForTourTarget(
  targetName: string,
  found: (rect: DOMRect) => void,
  missing: () => void,
): () => void {
  let tries = 0;
  const timer = setInterval(() => {
    const target = document.querySelector<HTMLElement>(
      `[data-tour='${targetName}']`,
    );
    if (target) {
      found(target.getBoundingClientRect());
      clearInterval(timer);
    } else if (++tries >= 25) {
      missing();
      clearInterval(timer);
    }
  }, 100);
  return () => clearInterval(timer);
}

export function usePathyTourTarget(step?: TourStep) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [missing, setMissing] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!step) {
      return;
    }
    setMissing(false);
    setRect(null);
    let cancelled = false;
    let stopWaiting: (() => void) | undefined;
    const start = async () => {
      const path = await tourPath(step.path);
      if (cancelled) {
        return;
      }
      if (pathname + window.location.search !== path) {
        router.push(path);
      }
      stopWaiting = waitForTourTarget(step.target, setRect, () =>
        setMissing(true),
      );
    };
    void start();
    return () => {
      cancelled = true;
      stopWaiting?.();
    };
  }, [step, pathname, router]);
  return { rect, missing };
}
