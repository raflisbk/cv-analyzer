import { useEffect, useState } from "react";

export function useAccountMenuLayout(
  open: boolean,
  rootRef: React.RefObject<HTMLDivElement | null>,
) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!open) {
      setScrolled(false);
      return;
    }
    const measure = () => {
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      rootRef.current?.style.setProperty("--menu-top", `${top}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, rootRef]);
  const onScroll = (event: React.UIEvent<HTMLElement>) =>
    setScrolled(event.currentTarget.scrollTop > 0);
  return { scrolled, onScroll };
}
