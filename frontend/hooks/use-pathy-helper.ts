"use client";

import { useState } from "react";
import { usePathy } from "@/components/pathy/pathy-context";
import type { PathyPose } from "@/lib/pathy/pose";
import { usePathyIdle } from "./use-pathy-idle";

const quips: [PathyPose, string][] = [
  ["idea", "Try Match it to a job."],
  ["proud", "I read CVs for breakfast."],
  ["detective", "I spot weak verbs from a mile."],
];

export function usePathyHelper() {
  const [open, setOpen] = useState(false);
  const idle = usePathyIdle();
  const pathy = usePathy();
  const toggle = () => {
    setOpen(!open);
    if (open) {
      const [pose, text] = quips[Math.floor(Math.random() * quips.length)];
      pathy.react(pose, text);
    }
  };
  return { open, idle, toggle, close: () => setOpen(false) };
}
