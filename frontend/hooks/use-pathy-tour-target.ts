"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TourStep } from "@/lib/pathy/tours";
import { listCvs } from "@/lib/app-api/cvs";

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
    let tries = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    const findTarget = () => {
      const target = document.querySelector<HTMLElement>(
        `[data-tour='${step.target}']`,
      );
      if (target) {
        setRect(target.getBoundingClientRect());
        clearInterval(timer);
      } else if (++tries >= 25) {
        setMissing(true);
        clearInterval(timer);
      }
    };
    const start = async () => {
      let path = step.path;
      if (path.includes(":jobId")) {
        const cvs = await listCvs().catch(() => []);
        path = cvs[0]
          ? path.replace(":jobId", encodeURIComponent(cvs[0].jobId))
          : "/app/cvs";
      }
      if (cancelled) {
        return;
      }
      if (pathname + window.location.search !== path) {
        router.push(path);
      }
      timer = setInterval(findTarget, 100);
    };
    void start();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [step, pathname, router]);
  return { rect, missing };
}
