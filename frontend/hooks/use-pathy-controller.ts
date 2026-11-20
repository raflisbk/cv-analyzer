"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { burstConfetti } from "@/lib/pathy/confetti";
import type { PathyPose } from "@/lib/pathy/pose";
import { usePathyIntro } from "./use-pathy-intro";

export function usePathyController() {
  const { t } = useT();
  const [pose, setPose] = useState<PathyPose>("helpdesk");
  const [bubble, setBubble] = useState("");
  const [tour, setTour] = useState<string | null>(null);
  const helperRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const react = useCallback(
    (nextPose: PathyPose, text: string, anchor?: HTMLElement | null) => {
      setPose(nextPose);
      setBubble(text);
      burstConfetti(anchor ?? helperRef.current);
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        setBubble("");
        setPose("helpdesk");
      }, 2800);
    },
    [],
  );
  usePathyIntro(setBubble, timer, t("pathy.ui.intro"));
  const api = useMemo(
    () => ({
      react,
      burst: (anchor?: HTMLElement | null) =>
        burstConfetti(anchor ?? helperRef.current),
      startTour: (name = "full") => setTour(name),
    }),
    [react],
  );
  return { pose, bubble, tour, setTour, helperRef, api };
}
