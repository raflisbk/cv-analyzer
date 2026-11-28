import { useEffect, useRef, useState } from "react";
import { faqMotion } from "@/components/landing/motion/faq";
import { useLandingStory } from "@/hooks/use-landing-story";
import { loadGsap } from "@/lib/gsap-loader";
import {
  FAQ_REFRESH_DELAY_MS,
  FAQ_SCROLL,
  nextFaqOpen,
} from "@/lib/landing-faq";

export function useFaqSection() {
  const ref = useLandingStory(faqMotion, 120, undefined, FAQ_SCROLL);
  const manual = useRef(false);
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) {
      return;
    }
    const advance = (event: Event) => {
      if (manual.current) {
        return;
      }
      const index = (event as CustomEvent<number>).detail;
      setOpen(index >= 0 ? index : null);
    };
    panel.addEventListener("landing-faq-step", advance);
    return () => panel.removeEventListener("landing-faq-step", advance);
  }, [ref]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    }, FAQ_REFRESH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open]);
  const toggle = (index: number) => {
    manual.current = true;
    setOpen((current) => nextFaqOpen(current, index));
  };
  return { ref, open, toggle };
}
