import {
  useEffect,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from "react";

export function usePathyIntro(
  setBubble: Dispatch<SetStateAction<string>>,
  timer: RefObject<ReturnType<typeof setTimeout> | null>,
) {
  useEffect(() => {
    if (sessionStorage.getItem("pathy-intro")) {
      return;
    }
    const intro = setTimeout(() => {
      setBubble("Need a hand?");
      sessionStorage.setItem("pathy-intro", "1");
      timer.current = setTimeout(() => setBubble(""), 2800);
    }, 2500);
    return () => clearTimeout(intro);
  }, [setBubble, timer]);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [timer],
  );
}
