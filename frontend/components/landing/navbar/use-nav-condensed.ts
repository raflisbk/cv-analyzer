import { useEffect, useState } from "react";

const CONDENSE_AFTER = 40;

export function useNavCondensed() {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const update = () => setCondensed(window.scrollY > CONDENSE_AFTER);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return condensed;
}
