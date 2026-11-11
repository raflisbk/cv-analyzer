import { useEffect, useState } from "react";
import type { PathyPose } from "@/lib/pathy/pose";

const idlePoses: PathyPose[] = ["helpdesk", "think", "guide"];

export function usePathyIdle(): PathyPose {
  const [idle, setIdle] = useState<PathyPose>("helpdesk");
  useEffect(() => {
    const timer = setInterval(
      () => setIdle(idlePoses[Math.floor(Math.random() * idlePoses.length)]),
      18000,
    );
    return () => clearInterval(timer);
  }, []);
  return idle;
}
