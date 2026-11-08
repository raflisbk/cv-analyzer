import { useEffect, useRef, useState } from "react";
import { faqMotion } from "@/components/landing/motion/faq";
import { nextFaqOpen } from "@/lib/landing-faq";
import { useLandingStory } from "./use-landing-story";

export function useLandingFaq() {
  const ref = useLandingStory(faqMotion, 120);
  const manual = useRef(false);
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const advance = (event: Event) => {
      if (!manual.current) {
        const index = (event as CustomEvent<number>).detail;
        setOpen(index >= 0 ? index : null);
      }
    };
    panel.addEventListener("landing-faq-step", advance);
    return () => panel.removeEventListener("landing-faq-step", advance);
  }, [ref]);
  const toggle = (index: number) => {
    manual.current = true;
    setOpen((current) => nextFaqOpen(current, index));
  };
  return { ref, open, toggle };
}
