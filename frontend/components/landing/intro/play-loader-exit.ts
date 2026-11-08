import type { loadGsap } from "@/lib/gsap-loader";
import { introTime } from "@/lib/landing-intro-timing";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function playLoaderExit(
  gsap: Gsap,
  timeline: gsap.core.Timeline,
  loader: HTMLElement,
  unlock: () => void,
) {
  timeline
    .call(() => window.scrollTo(0, 0), [], introTime.exit)
    .to(
      loader,
      {
        yPercent: -104,
        borderBottomLeftRadius: "50% 140px",
        borderBottomRightRadius: "50% 140px",
        duration: introTime.lift,
        ease: "power4.inOut",
      },
      introTime.exit,
    )
    .call(unlock, [], introTime.exit + 0.35);
}
