"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap-loader";

/* "Living CV" mascot: a monochrome sheet of paper with legs that roams the
   whole site — fixed to the viewport floor (on top of the floating marquee
   bar), so it walks along with you through every section. Interactions:
   - pupils track the cursor
   - cursor coming close startles it (stops, squash-stretch hop, arm wave)
   - click makes it somersault
   - ZONE CONDUCTOR: any element tagged `data-mascot-zone="<name>"` becomes
     an instrument — when the mascot walks under one that's on screen, it
     FLIES UP to the element (paper flutter, legs dangling), taps it — the
     `pathkr:mascot-zone` event fires at the moment of contact so the
     effect reads as caused by the mascot — then glides back down and
     resumes patrolling. Sections opt in by tagging elements; the mascot
     never needs to know what the effects are. Current zones: card-stub /
     hero-rows / hero-stamp (hero) and rag-graph (explainer burst).
   Hidden on mobile; does nothing under prefers-reduced-motion (static pose). */

export const MASCOT_ZONE_EVENT = "pathkr:mascot-zone";
/* Fired once, the moment the mascot kicks the hero card during its walk-in
   intro — the hero's master reveal timeline starts on this signal (with a
   timeout fallback for mobile, where the mascot is hidden) */
export const MASCOT_KICK_EVENT = "pathkr:mascot-kick";
const ZONE_COOLDOWN_MS = 12000;
const ZONE_SCAN_MS = 250;
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

        // Patrol walk, left <-> right — starts after the walk-in intro
        const patrol = gsap.fromTo(
          char,
          { x: 16 },
          {
            x: maxX,
            duration: 30,
            ease: "none",
            yoyo: true,
            repeat: -1,
            paused: true,
          },
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

        // Walk-in intro: enter from off-screen left, stop at the hero card's
        // corner, kick it awake (fires MASCOT_KICK_EVENT — the hero's reveal
        // timeline starts on it), then begin patrolling
        gsap.set(char, { x: -80 });
        gsap
          .timeline()
          .to(char, { x: 16, duration: 1.5, ease: "power1.inOut" })
          .add(() => {
            walkTweens.forEach((tween) => tween.pause());
            gsap.set([legL, legR], { rotation: 0 });
          })
          .to(flip, { rotation: -8, y: 2, duration: 0.16, ease: "power2.in" })
          .to(legR, {
            rotation: -70,
            duration: 0.12,
            ease: "power3.out",
            transformOrigin: "top center",
          })
          .add(() => window.dispatchEvent(new CustomEvent(MASCOT_KICK_EVENT)))
          .to(flip, { rotation: 4, y: -6, duration: 0.18, ease: "power2.out" }, "<")
          .to(legR, { rotation: 0, duration: 0.25, ease: "power2.inOut" })
          .to(flip, { rotation: 0, y: 0, duration: 0.25, ease: "bounce.out" }, "<")
          .add(() => {
            walkTweens.forEach((tween) => tween.resume());
            patrol.play();
          });

        // Fly up to a zone element, touch it (the zone event fires at the
        // moment of contact, so the effect reads as caused by the mascot),
        // then flutter back down to the floor and resume patrolling.
        let visiting = false;
        const visitZone = (el: HTMLElement, zone: string) => {
          visiting = true;
          patrol.pause();
          walkTweens.forEach((tween) => tween.pause());
          gsap.set([legL, legR], { rotation: 0 });

          const rect = el.getBoundingClientRect();
          const rootRect = root.getBoundingClientRect();
          const targetX = Math.min(
            Math.max(rect.left + rect.width / 2 - CHAR_W / 2, 8),
            root.clientWidth - CHAR_W - 8,
          );
          // Hover with the paper's top edge kissing the element's bottom
          const desiredBottom = Math.min(
            rect.bottom + 34,
            rootRect.bottom - 4,
          );
          const targetY = Math.max(
            desiredBottom - rootRect.bottom,
            150 - rootRect.bottom, // never higher than just below the navbar
          );

          // Legs dangle while airborne
          const dangle = gsap.to([legL, legR], {
            rotation: (i: number) => (i === 0 ? 9 : -9),
            transformOrigin: "top center",
            duration: 0.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });

          gsap
            .timeline({
              onComplete: () => {
                dangle.kill();
                gsap.set([legL, legR], { rotation: 0 });
                walkTweens.forEach((tween) => tween.resume());
                patrol.resume();
                visiting = false;
              },
            })
            // Take off in an arc, fluttering like a sheet of paper
            .to(char, { x: targetX, duration: 1.2, ease: "power1.inOut" })
            .to(char, { y: targetY, duration: 1.2, ease: "power2.out" }, "<")
            .to(
              flip,
              {
                rotation: 7,
                duration: 0.28,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
              },
              "<",
            )
            // Contact: tap the element, the effect fires right now
            .add(() =>
              window.dispatchEvent(
                new CustomEvent(MASCOT_ZONE_EVENT, { detail: { zone } }),
              ),
            )
            .to(flip, {
              rotation: -14,
              y: -8,
              duration: 0.16,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            })
            .to(arm, {
              rotation: -110,
              transformOrigin: "top center",
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: "back.out(2)",
            })
            // Admire the effect for a beat, then glide back to the floor
            .to(char, { y: 0, duration: 1.0, ease: "power2.in" }, "+=0.7")
            .to(
              flip,
              { rotation: 0, y: 0, duration: 0.35, ease: "sine.out" },
              "<",
            );
        };

        // Face the walking direction + visit any zone we walk under
        let lastX = 0;
        let lastZoneScan = 0;
        const zoneCooldown = new Map<string, number>();
        const tick = () => {
          const x = Number(gsap.getProperty(char, "x"));
          if (Math.abs(x - lastX) > 0.1) {
            gsap.set(flip, { scaleX: x > lastX ? 1 : -1 });
          }
          lastX = x;

          const now = performance.now();
          if (
            now - lastZoneScan < ZONE_SCAN_MS ||
            visiting ||
            patrol.paused()
          ) {
            return;
          }
          lastZoneScan = now;
          const charX = x + CHAR_W / 2;
          for (const el of document.querySelectorAll<HTMLElement>(
            "[data-mascot-zone]",
          )) {
            const zone = el.dataset.mascotZone;
            if (!zone) {
              continue;
            }
            const rect = el.getBoundingClientRect();
            const onScreen =
              rect.width > 0 &&
              rect.top < window.innerHeight - 100 &&
              rect.bottom > 0;
            if (!onScreen || charX < rect.left || charX > rect.right) {
              continue;
            }
            if (now - (zoneCooldown.get(zone) ?? 0) < ZONE_COOLDOWN_MS) {
              continue;
            }
            zoneCooldown.set(zone, now);
            visitZone(el, zone);
            break; // one visit at a time
          }
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

          if (dist < 110 && !alerted && !visiting) {
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
          if (flipping || visiting) {
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
