"use client";

import { createContext, useContext } from "react";
import type { PathyPose } from "@/lib/pathy/pose";

export interface PathyApi {
  react: (pose: PathyPose, text: string, anchor?: HTMLElement | null) => void;
  burst: (anchor?: HTMLElement | null) => void;
  startTour: (name?: string) => void;
}

const noop: PathyApi = {
  react: () => {},
  burst: () => {},
  startTour: () => {},
};

export const PathyContext = createContext<PathyApi>(noop);

export function usePathy(): PathyApi {
  return useContext(PathyContext);
}
