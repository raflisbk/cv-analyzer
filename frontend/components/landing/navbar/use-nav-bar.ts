import { useEffect, useRef, useState } from "react";

const CONDENSE_AFTER = 24;

export function useNavBar() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const update = () => {
      const spacerTop = spacerRef.current?.getBoundingClientRect().top ?? 0;
      if (headerRef.current) {
        headerRef.current.style.top = `${Math.max(0, spacerTop)}px`;
      }
      setCondensed(spacerTop < -CONDENSE_AFTER);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return { spacerRef, headerRef, condensed };
}
