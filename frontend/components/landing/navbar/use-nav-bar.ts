import { useRef } from "react";
import { useNavCtaHandoff } from "@/hooks/use-nav-cta-handoff";
import { useNavProgress } from "@/hooks/use-nav-progress";
import { useNavTone } from "@/hooks/use-nav-tone";

export function useNavBar() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  useNavProgress(spacerRef, headerRef);
  useNavTone(headerRef);
  const ctaShown = useNavCtaHandoff(headerRef, slotRef);
  return { spacerRef, headerRef, slotRef, ctaShown };
}
