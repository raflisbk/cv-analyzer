"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PathyContext } from "./pathy-context";
import { usePathyController } from "@/hooks/use-pathy-controller";
import { isChatRoute } from "@/components/app-shell/chat-route";
import PathyHelper from "./pathy-helper";
import PathyTour from "./pathy-tour";

export default function PathyProvider({ children }: { children: ReactNode }) {
  const { pose, bubble, tour, setTour, helperRef, api } = usePathyController();
  const showHelper = !isChatRoute(usePathname());
  return (
    <PathyContext.Provider value={api}>
      {children}
      {showHelper && (
        <PathyHelper ref={helperRef} pose={pose} bubble={bubble} />
      )}
      <PathyTour name={tour} close={() => setTour(null)} />
    </PathyContext.Provider>
  );
}
