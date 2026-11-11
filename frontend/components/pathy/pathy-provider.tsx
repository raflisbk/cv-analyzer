"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PathyContext } from "./pathy-context";
import { burstConfetti } from "@/lib/pathy/confetti";
import type { PathyPose } from "@/lib/pathy/pose";
import PathyHelper from "./pathy-helper";
import PathyTour from "./pathy-tour";

export default function PathyProvider({ children }: { children: ReactNode }) {
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
  useEffect(() => {
    if (sessionStorage.getItem("pathy-intro")) {
      return;
    }
    const intro = setTimeout(() => {
      setBubble("Need a hand?");
      sessionStorage.setItem("pathy-intro", "1");
      timer.current = setTimeout(() => setBubble(""), 2800);
    }, 2500);
    return () => clearTimeout(intro);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );
  const api = useMemo(
    () => ({
      react,
      burst: (anchor?: HTMLElement | null) =>
        burstConfetti(anchor ?? helperRef.current),
      startTour: (name = "full") => setTour(name),
    }),
    [react],
  );
  return (
    <PathyContext.Provider value={api}>
      {children}
      <PathyHelper ref={helperRef} pose={pose} bubble={bubble} />
      <PathyTour name={tour} close={() => setTour(null)} />
    </PathyContext.Provider>
  );
}
