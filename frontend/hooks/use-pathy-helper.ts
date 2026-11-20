"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { usePathy } from "@/components/pathy/pathy-context";
import type { PathyPose } from "@/lib/pathy/pose";
import { usePathyIdle } from "./use-pathy-idle";

const quips: [PathyPose, string][] = [
  ["idea", "pathy.ui.quipIdea"],
  ["proud", "pathy.ui.quipProud"],
  ["detective", "pathy.ui.quipDetective"],
];

export function usePathyHelper() {
  const [open, setOpen] = useState(false);
  const idle = usePathyIdle();
  const pathy = usePathy();
  const { t } = useT();
  const toggle = () => {
    setOpen(!open);
    if (open) {
      const [pose, key] = quips[Math.floor(Math.random() * quips.length)];
      pathy.react(pose, t(key));
    }
  };
  return { open, idle, toggle, close: () => setOpen(false) };
}
