import { useRef } from "react";
import { useNavProgress } from "@/hooks/use-nav-progress";
import { useNavTone } from "@/hooks/use-nav-tone";

export function useNavBar() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useNavProgress(spacerRef, headerRef);
  useNavTone(headerRef);
  return { spacerRef, headerRef };
}
