import {
  useEffect,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from "react";

export function usePathyIntro(
  setBubble: Dispatch<SetStateAction<string>>,
  timer: RefObject<ReturnType<typeof setTimeout> | null>,
  introText: string,
) {
  useEffect(() => {
    if (sessionStorage.getItem("pathy-intro")) {
      return;
    }
    const intro = setTimeout(() => {
      setBubble(introText);
      sessionStorage.setItem("pathy-intro", "1");
      timer.current = setTimeout(() => setBubble(""), 2800);
    }, 2500);
    return () => clearTimeout(intro);
  }, [setBubble, timer, introText]);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [timer],
  );
}
