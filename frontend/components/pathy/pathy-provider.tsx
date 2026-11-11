"use client";

import type { ReactNode } from "react";
import { PathyContext } from "./pathy-context";
import { usePathyController } from "@/hooks/use-pathy-controller";
import PathyHelper from "./pathy-helper";
import PathyTour from "./pathy-tour";

export default function PathyProvider({ children }: { children: ReactNode }) {
  const { pose, bubble, tour, setTour, helperRef, api } = usePathyController();
  return (
    <PathyContext.Provider value={api}>
      {children}
      <PathyHelper ref={helperRef} pose={pose} bubble={bubble} />
      <PathyTour name={tour} close={() => setTour(null)} />
    </PathyContext.Provider>
  );
}
