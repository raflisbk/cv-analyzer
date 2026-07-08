"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";

/* "Living CV" mascot: a monochrome sheet of paper with legs that roams the
   whole site — fixed to the viewport floor (on top of the floating marquee
   bar), so it walks along with you through every section. Interactions:
   - pupils track the cursor
   - cursor coming close startles it (stops, squash-stretch hop, arm wave)
   - click makes it somersault
   - passing the right side fires `pathkr:mascot-greet`, which the hero RAG
     graph listens to (pulse/orbit burst)
   Hidden on mobile; does nothing under prefers-reduced-motion (static pose). */

const GREET_EVENT = "pathkr:mascot-greet";
const INK = "#141414";
const CREAM = "#F5F2D8";

export default function HeroMascot() {
  const rootRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !charRef.current) {
      return;
    }
    let mm: { revert: () => void } | null = null;

    loadGsap().then(({ gsap }) => {
      const root = rootRef.current;
      const char = charRef.current;
      if (!root || !char) {
        return;
      }
      const media = gsap.matchMedia(rootRef);
      mm = media;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const flip = char.querySelector<HTMLElement>(".m-flip")!;
        const body = char.querySelector<SVGGElement>(".m-body")!;
        const legL = char.querySelector<SVGGElement>(".m-leg-l")!;
        const legR = char.querySelector<SVGGElement>(".m-leg-r")!;
        const arm = char.querySelector<SVGGElement>(".m-arm")!;
        const pupils = char.querySelectorAll<SVGGElement>(".m-pupil");

        const CHAR_W = 64;
        const maxX = () => Math.max(root.clientWidth - CHAR_W - 32, 200);

        // Patrol walk, left <-> right
        const patrol = gsap.fromTo(
          char,
          { x: 16 },
          { x: maxX, duration: 30, ease: "none", yoyo: true, repeat: -1 },
        );
        const resizeObserver = new ResizeObserver(() => patrol.invalidate());
        resizeObserver.observe(root);

        // Walk cycle: body bob + alternating legs
        const bob = gsap.to(body, {
          y: -2.5,
          duration: 0.22,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        const stepL = gsap.to(legL, {
          rotation: 26,
          transformOrigin: "top center",
          duration: 0.22,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        const stepR = gsap.to(legR, {
          rotation: -26,
          transformOrigin: "top center",
          duration: 0.22,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        const walkTweens = [bob, stepL, stepR];

        // Face the walking direction + greet the graph when passing under it
        let lastX = 0;
        let lastGreet = 0;
        const tick = () => {
          const x = Number(gsap.getProperty(char, "x"));
          if (Math.abs(x - lastX) > 0.1) {
            gsap.set(flip, { scaleX: x > lastX ? 1 : -1 });
          }
          // Greet zone: right area, under the RAG graph
          const now = performance.now();
          if (
            x > root.clientWidth * 0.72 &&
            now - lastGreet > 8000 &&
            !patrol.paused()
          ) {
            lastGreet = now;
            window.dispatchEvent(new CustomEvent(GREET_EVENT));
            gsap
              .timeline()
              .to(arm, {
                rotation: -120,
                transformOrigin: "top center",
                duration: 0.25,
                ease: "back.out(2)",
              })
              .to(arm, { rotation: -90, duration: 0.15, yoyo: true, repeat: 3 })
              .to(arm, { rotation: 0, duration: 0.3, ease: "power2.in" });
          }
          lastX = x;
        };
        gsap.ticker.add(tick);

        // Pupils follow the cursor; proximity startles the mascot
        let alerted = false;
        const onPointerMove = (event: PointerEvent) => {
          const rect = char.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = event.clientX - cx;
          const dy = event.clientY - cy;
          const dist = Math.hypot(dx, dy);

          const angle = Math.atan2(dy, dx);
          const reach = Math.min(2.4, dist / 40);
          pupils.forEach((pupil) => {
            gsap.to(pupil, {
              x: Math.cos(angle) * reach,
              y: Math.sin(angle) * reach,
              duration: 0.2,
              overwrite: "auto",
            });
          });

          if (dist < 110 && !alerted) {
            alerted = true;
            patrol.pause();
            walkTweens.forEach((tween) => tween.pause());
            gsap.set([legL, legR], { rotation: 0 });
            gsap
              .timeline()
              .to(flip, {
                scaleY: 0.82,
                y: 4,
                duration: 0.1,
                ease: "power2.in",
              })
              .to(flip, {
                scaleY: 1.06,
                y: -14,
                duration: 0.18,
                ease: "power2.out",
              })
              .to(flip, {
                scaleY: 1,
                y: 0,
                duration: 0.22,
                ease: "bounce.out",
              });
          } else if (dist > 190 && alerted) {
            alerted = false;
            patrol.resume();
            walkTweens.forEach((tween) => tween.resume());
          }
        };
        window.addEventListener("pointermove", onPointerMove);

        // Click: somersault
        let flipping = false;
        const onClick = () => {
          if (flipping) {
            return;
          }
          flipping = true;
          gsap
            .timeline({ onComplete: () => (flipping = false) })
            .to(flip, { y: -34, duration: 0.28, ease: "power2.out" })
            .to(
              flip,
              { rotation: 360, duration: 0.45, ease: "power1.inOut" },
              "<",
            )
            .to(flip, { y: 0, duration: 0.3, ease: "bounce.out" })
            .set(flip, { rotation: 0 });
        };
        char.addEventListener("click", onClick);

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("pointermove", onPointerMove);
          char.removeEventListener("click", onClick);
          resizeObserver.disconnect();
        };
      });
    });

    return () => {
      mm?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-[34px] z-50 hidden h-24 md:block"
    >
      <div
        ref={charRef}
        className="pointer-events-auto absolute bottom-0 cursor-pointer select-none"
        style={{ width: 64, height: 88 }}
      >
        <div className="m-flip origin-bottom">
          <svg width="64" height="88" viewBox="0 0 64 88" fill="none">
            {/* Legs */}
            <g className="m-leg-l">
              <rect
                x="22.5"
                y="66"
                width="3.5"
                height="14"
                rx="1.75"
                fill={INK}
              />
              <ellipse cx="26" cy="81.5" rx="6" ry="3" fill={INK} />
            </g>
            <g className="m-leg-r">
              <rect
                x="38"
                y="66"
                width="3.5"
                height="14"
                rx="1.75"
                fill={INK}
              />
              <ellipse cx="41.5" cy="81.5" rx="6" ry="3" fill={INK} />
            </g>

            {/* Waving arm (right side) */}
            <g className="m-arm">
              <rect x="56" y="36" width="3.2" height="13" rx="1.6" fill={INK} />
              <circle cx="57.6" cy="50" r="2.6" fill={INK} />
            </g>

            {/* Paper body */}
            <g className="m-body">
              <rect
                x="6"
                y="2"
                width="52"
                height="66"
                rx="9"
                fill={CREAM}
                stroke={INK}
                strokeWidth="3"
              />
              {/* Folded corner */}
              <path d="M43 3 L57 17 L43 17 Z" fill={INK} />
              {/* Score sticker */}
              <circle
                cx="15"
                cy="12"
                r="5"
                fill="#CAFF43"
                stroke={INK}
                strokeWidth="2"
              />

              {/* Eyes */}
              <circle
                cx="24"
                cy="30"
                r="6"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.5"
              />
              <circle
                cx="41"
                cy="30"
                r="6"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.5"
              />
              <g className="m-pupil">
                <circle cx="24" cy="30" r="2.6" fill={INK} />
              </g>
              <g className="m-pupil">
                <circle cx="41" cy="30" r="2.6" fill={INK} />
              </g>

              {/* Mouth */}
              <path
                d="M29 41 Q32.5 45 36 41"
                stroke={INK}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* CV skeleton lines */}
              <rect
                x="14"
                y="52"
                width="26"
                height="3"
                rx="1.5"
                fill="rgba(17,17,17,0.28)"
              />
              <rect
                x="14"
                y="59"
                width="35"
                height="3"
                rx="1.5"
                fill="rgba(17,17,17,0.18)"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
