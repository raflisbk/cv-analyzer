import { useEffect, useState } from "react";
import type { RefObject } from "react";
import {
  HERO_CTA_VISIBLE_RATIO,
  heroCtaShowing,
} from "@/components/landing/navbar/nav-handoff";

const SLOT_GAP = 8;

function trackSlotWidth(
  slot: HTMLElement,
  header: HTMLElement,
): ResizeObserver {
  const observer = new ResizeObserver(() => {
    header.style.setProperty("--cta-shift", `${slot.offsetWidth + SLOT_GAP}px`);
  });
  observer.observe(slot);
  return observer;
}

export function useNavCtaHandoff(
  headerRef: RefObject<HTMLElement | null>,
  slotRef: RefObject<HTMLElement | null>,
) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const header = headerRef.current;
    const slot = slotRef.current;
    if (!header || !slot) return;
    const sizeObserver = trackSlotWidth(slot, header);
    const hero = document.querySelector<HTMLElement>("[data-hero-cta]");
    if (!hero) {
      setShown(true);
      return () => sizeObserver.disconnect();
    }
    let ratio = 1;
    const apply = () => setShown(!heroCtaShowing(ratio, hero.style));
    const intersection = new IntersectionObserver(
      ([entry]) => {
        ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        apply();
      },
      { threshold: [0, HERO_CTA_VISIBLE_RATIO, 1] },
    );
    const styleWatch = new MutationObserver(apply);
    intersection.observe(hero);
    styleWatch.observe(hero, { attributes: true, attributeFilter: ["style"] });
    return () => {
      sizeObserver.disconnect();
      intersection.disconnect();
      styleWatch.disconnect();
    };
  }, [headerRef, slotRef]);
  return shown;
}
