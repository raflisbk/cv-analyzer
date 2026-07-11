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
        const cape = char.querySelector<SVGPathElement>(".m-cape")!;
        const torch = char.querySelector<SVGGElement>(".m-torch")!;
        const spark = char.querySelector<SVGPathElement>(".m-spark")!;
        const pupils = char.querySelectorAll<SVGGElement>(".m-pupil");
        const standG = char.querySelector<SVGGElement>(".m-stand")!;
        const fallG = char.querySelector<SVGGElement>(".m-fall")!;
        const fallCape = char.querySelector<SVGPathElement>(".m-fall-cape")!;
        const fallLines = char.querySelector<SVGGElement>(".m-fall-lines")!;
        const shades = char.querySelector<SVGGElement>(".m-shades")!;
        const armsCrossed = char.querySelector<SVGGElement>(".m-arms-crossed")!;
        const grabG = char.querySelector<SVGGElement>(".m-grab")!;
        const grabSweat = char.querySelector<SVGPathElement>(".m-grab-sweat")!;
        const grabLegs = char.querySelector<SVGGElement>(".m-grab-legs")!;
        const kickG = char.querySelector<SVGGElement>(".m-kick")!;
        // Cape pivots where it attaches: the neck (top center)
        gsap.set(cape, { transformOrigin: "50% 5%" });
        gsap.set(spark, { transformOrigin: "50% 50%" });
        gsap.set(fallG, { transformOrigin: "50% 56%" });
        gsap.set(fallCape, { transformOrigin: "50% 100%" });

        // Pose states. "cruise" = SUPERMAN flight for the patrol: the
        // standing art tipped horizontal, lead arm punched out, cape
        // streaming — same attitude as the zone flights, so the character
        // reads consistently everywhere.
        type Pose = "stand" | "fall" | "cruise" | "grab";
        let pose: Pose = "stand";
        let introDone = false;
        const setPose = (next: Pose) => {
          pose = next;
          gsap.set(standG, {
            autoAlpha: next === "stand" || next === "cruise" ? 1 : 0,
          });
          gsap.set(fallG, { autoAlpha: next === "fall" ? 1 : 0 });
          gsap.set(grabG, { autoAlpha: next === "grab" ? 1 : 0 });
        };

        // Superman flight attitude on the standing art (applied while
        // cruising; the porpoise physics in the tick modulate around it)
        let cruiseRipple: ReturnType<typeof gsap.to> | null = null;
        const enterCruiseAttitude = () => {
          gsap.set(flip, { transformOrigin: "50% 55%" });
          gsap.set([legL, legR], { rotation: 6 });
          gsap.to(arm, {
            rotation: -158,
            transformOrigin: "top center",
            duration: 0.25,
            ease: "power2.out",
          });
          gsap.to(cape, { rotation: 32, scaleY: 1.26, duration: 0.25 });
          cruiseRipple = gsap.to(cape, {
            rotation: 20,
            duration: 0.3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 0.25,
          });
        };
        const exitCruiseAttitude = () => {
          cruiseRipple?.kill();
          cruiseRipple = null;
          gsap.set([legL, legR], { rotation: 0 });
          gsap.to(arm, { rotation: 0, duration: 0.2, overwrite: "auto" });
          gsap.to(cape, {
            rotation: 0,
            scaleY: 1,
            duration: 0.25,
            overwrite: "auto",
          });
          gsap.to(flip, { rotation: 0, y: 0, duration: 0.22, overwrite: "auto" });
        };

        // Transition between grounded and flying: the paper flips through
        // edge-on (scaleX squish, preserving facing) and comes out in the
        // other attitude
        let folding = false;
        const foldTo = (next: Pose, onDone?: () => void) => {
          folding = true;
          const facing = Math.sign(Number(gsap.getProperty(flip, "scaleX"))) || 1;
          gsap
            .timeline({
              onComplete: () => {
                folding = false;
                onDone?.();
              },
            })
            .to(flip, {
              scaleX: 0.12 * facing,
              duration: 0.13,
              ease: "power2.in",
            })
            .add(() => {
              setPose(next);
              if (next === "cruise") {
                enterCruiseAttitude();
              } else {
                exitCruiseAttitude();
              }
            })
            .to(flip, {
              scaleX: facing,
              duration: 0.2,
              ease: "back.out(2)",
            });
        };

        const CHAR_W = 64;
        const maxX = () => Math.max(root.clientWidth - CHAR_W - 32, 200);

        // Patrol flight, left <-> right — starts after the intro
        const patrol = gsap.fromTo(
          char,
          { x: 16 },
          {
            x: maxX,
            duration: 13,
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
        // Cape sways gently with the walk cycle
        const capeSway = gsap.to(cape, {
          rotation: 4,
          duration: 0.44,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        const walkTweens = [bob, stepL, stepR, capeSway];

        // Falling-paper physics: real dropped sheets don't drift in a sine —
        // each swing is a U-shaped glide: stall at the edge (slow, high),
        // dive down-and-across gaining speed, then lift pulls the sheet UP
        // at the far side into the next stall, where it flips tilt and
        // glides back. `pts` are the stall x-positions (last one = where it
        // lands); y drops linearly across the whole fall with a U-dip per
        // swing; pitch noses down into each dive, flat at the stalls.
        /* Falling-paper PHYSICS SIMULATION (per-frame integration on the
           gsap ticker) — replaces the old parametric curves. True momentum:
           gravity, speed-dependent lift/drag, and the real falling-paper
           limit cycle as a state machine:
           - GLIDE: the tilted sheet slides downhill, horizontal speed
             builds, lift (∝ vx²) progressively cancels the sink
           - STALL: lift wins — the sheet flares nose-up, trades its speed
             for a brief CLIMB, stops, flips over and glides back the
             other way
           - TUMBLE (random): it fails to catch the air and rolls end over
             end, dropping fast, until it recovers into a glide
           Thrown release velocity feeds straight in, so a flung mascot
           sails before fluttering down. Lands when y reaches the floor;
           duration/track are emergent, so callers pass an onLand. */
        const activeSims = new Set<() => void>();
        const paperFallSim = (opts: {
          x: number;
          y: number;
          vx?: number;
          vy?: number;
          onLand: (impact: number, landX: number) => void;
        }) => {
          const G = 620;
          let x = opts.x;
          let y = opts.y;
          let vx = opts.vx ?? (Math.random() - 0.5) * 90;
          let vy = opts.vy ?? 40;
          let dir = Math.sign(vx) || (Math.random() < 0.5 ? 1 : -1);
          let mode: "glide" | "stall" | "tumble" = "glide";
          let modeT = 0;
          let elapsed = 0;
          let rot = 0;
          let tumbleSpin = 0;
          const vStall = 190 + Math.random() * 70;
          const seed = Math.random() * 100;
          const minX = 8;
          const ceiling = 120 - root.getBoundingClientRect().bottom;

          const step = () => {
            const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 30);
            elapsed += dt;
            modeT += dt;

            if (mode === "glide") {
              vx += dir * G * 0.55 * dt - vx * 0.6 * dt;
              const lift = Math.min(1.25 * G, 0.011 * vx * vx);
              vy += (G - lift) * dt - vy * 1.6 * dt;
              if (Math.abs(vx) > vStall && modeT > 0.35) {
                if (Math.random() < 0.22) {
                  mode = "tumble";
                  modeT = 0;
                  tumbleSpin = dir * (7 + Math.random() * 5);
                } else {
                  mode = "stall";
                  modeT = 0;
                }
              }
            } else if (mode === "stall") {
              // flare: horizontal speed converts into a brief climb
              vy += (G - 0.02 * vx * vx) * dt - vy * 2.2 * dt;
              vy -= Math.abs(vx) * 3.4 * dt;
              vx -= vx * 3.8 * dt;
              if (Math.abs(vx) < 40 || modeT > 0.75) {
                dir = -dir;
                mode = "glide";
                modeT = 0;
              }
            } else {
              // tumbling: poor lift, fast drop, spinning end over end
              vy += G * 0.75 * dt - vy * 1.1 * dt;
              vx -= vx * 1.4 * dt;
              if (modeT > 0.5 + Math.random() * 0.5) {
                mode = "glide";
                modeT = 0;
                dir = Math.sign(tumbleSpin) || dir;
              }
            }

            // safety: never float forever
            if (elapsed > 9) {
              vy = Math.max(vy, 320);
            }
            x += vx * dt + Math.sin(elapsed * 40 + seed) * 26 * dt;
            y += vy * dt;

            // soft walls + ceiling
            const maxX = root.clientWidth - CHAR_W - 8;
            if (x < minX) {
              x = minX;
              vx = Math.abs(vx) * 0.4;
              dir = 1;
            } else if (x > maxX) {
              x = maxX;
              vx = -Math.abs(vx) * 0.4;
              dir = -1;
            }
            if (y < ceiling) {
              y = ceiling;
              vy = Math.max(vy, 0);
            }

            // visual: bank into the motion; stall flares nose-up; tumble
            // spins end over end (foreshortening thins it each half-turn)
            if (mode === "tumble") {
              rot += tumbleSpin * 57.3 * dt;
            } else {
              const flare = mode === "stall" ? -dir * 24 : 0;
              const target =
                Math.max(-44, Math.min(44, vx * 0.1)) + flare;
              rot += (target - rot) * Math.min(1, 8 * dt);
            }
            const sp = Math.hypot(vx, vy);
            gsap.set(char, { x, y });
            gsap.set(fallG, {
              rotation: rot + Math.sin(elapsed * 47 + seed) * 2.5,
              scaleY:
                0.24 + 0.76 * Math.abs(Math.cos((rot * Math.PI) / 180)),
            });
            gsap.set(fallLines, {
              opacity: Math.min(0.85, (sp / 420) * 0.85),
            });

            // touchdown
            if (y >= 0) {
              gsap.set(char, { x, y: 0 });
              gsap.ticker.remove(step);
              activeSims.delete(remove);
              opts.onLand(Math.min(1.6, Math.max(0.6, vy / 240)), x);
            }
          };
          const remove = () => gsap.ticker.remove(step);
          activeSims.add(remove);
          gsap.ticker.add(step);
        };

        // Expanding shockwave ring for hard impacts (the punch)
        const impactRing = (leftPx: number, topPx: number) => {
          const ring = document.createElement("span");
          ring.style.cssText = `position:absolute;left:${leftPx - 20}px;top:${topPx - 20}px;width:40px;height:40px;border:3px solid rgba(17,17,17,0.55);border-radius:50%;pointer-events:none;`;
          root.appendChild(ring);
          gsap.fromTo(
            ring,
            { scale: 0.2, opacity: 1 },
            {
              scale: 1.8,
              opacity: 0,
              duration: 0.55,
              ease: "power2.out",
              onComplete: () => ring.remove(),
            },
          );
        };

        // Little ink-dust burst at a root-relative point — spawned at every
        // physical contact (kick, tap, landing) so touches read as real
        const puff = (leftPx: number, topPx: number, strength = 1) => {
          for (let i = 0; i < 6; i++) {
            const dot = document.createElement("span");
            dot.style.cssText = `position:absolute;left:${leftPx}px;top:${topPx}px;width:5px;height:5px;border-radius:50%;background:rgba(17,17,17,0.45);pointer-events:none;`;
            root.appendChild(dot);
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.7;
            gsap.to(dot, {
              x: Math.cos(angle) * (14 + Math.random() * 16) * strength,
              y: Math.sin(angle) * (10 + Math.random() * 12) * strength,
              opacity: 0,
              scale: 0.3,
              duration: 0.5 + Math.random() * 0.25,
              ease: "power2.out",
              onComplete: () => dot.remove(),
            });
          }
        };

        // Paper-drop intro: the sheet is released above the viewport and
        // falls like real paper — swaying side to side in decaying arcs,
        // banking into each swing, legs trailing — flops onto the floor,
        // walks to the hero card's corner and kicks it awake
        // (MASCOT_KICK_EVENT starts the hero's reveal timeline).
        walkTweens.forEach((tween) => tween.pause());
        const dropHeight = Math.max(root.getBoundingClientRect().top + 60, 300);
        const dropAnchorX = 150;
        // start at the first stall point of the paper-fall (thrown in
        // slightly right of where it will land)
        gsap.set(char, { x: dropAnchorX + 75, y: -dropHeight });

        // Enter in the dedicated falling-sheet pose; air drag ripples its
        // upward-dragged cape the whole way down
        setPose("fall");
        const introCapeFlutter = gsap.to(fallCape, {
          rotation: 9,
          scaleY: 1.12,
          duration: 0.26,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        // Physics drop-in: the sim decides the track and duration; landing
        // continues the story (flop → walk to the card → kick)
        paperFallSim({
          x: dropAnchorX + 75,
          y: -dropHeight,
          vx: -70,
          onLand: (impact, landX) =>
            gsap
              .timeline()
              // Touch down: pop back to the standing pose, squash, dust
              .add(() => {
                introCapeFlutter.kill();
                gsap.set(fallCape, { rotation: 0, scaleY: 1 });
                gsap.set(fallG, { rotation: 0, scaleY: 1 });
                setPose("stand");
                puff(landX + CHAR_W / 2, 84, impact);
              })
              .to(flip, {
                scaleY: 0.8,
                y: 5,
                transformOrigin: "50% 100%",
                duration: 0.14,
                ease: "power2.in",
              })
              .to(flip, { scaleY: 1, y: 0, duration: 0.35, ease: "back.out(2.2)" })
              .set([legL, legR], { rotation: 0 })
              // Dust itself off, then walk to the card's corner
              .add(() => walkTweens.forEach((tween) => tween.resume()))
              .to(char, {
                x: 16,
                duration: Math.min(1.6, Math.abs(landX - 16) / 190 + 0.35),
                ease: "power1.inOut",
              })
              .add(() => {
                walkTweens.forEach((tween) => tween.pause());
                gsap.set([legL, legR], { rotation: 0 });
              })
              // FACE THE CARD (it's on the right — the old kick faced away,
              // which is why it read as kicking thin air)
              .set(flip, { scaleX: 1 })
              // Anticipation: coil back over the support leg... hold it...
              .to(flip, {
                rotation: -9,
                scaleY: 0.84,
                y: 4,
                transformOrigin: "50% 100%",
                duration: 0.24,
                ease: "power2.in",
              })
              // STRIKE — snap into the dedicated kick pose and lunge; the
              // impact (event + ring + dust AT the foot) lands on the same
              // frame, so the card visibly takes the hit
              .add(() => {
                gsap.set(standG, { autoAlpha: 0 });
                gsap.set(kickG, { autoAlpha: 1 });
                gsap.set(flip, { rotation: 0, scaleY: 1, y: 0 });
              }, "+=0.12")
              .to(char, { x: "+=20", duration: 0.09, ease: "power4.in" })
              .add(() => {
                window.dispatchEvent(new CustomEvent(MASCOT_KICK_EVENT));
                const cx = Number(gsap.getProperty(char, "x"));
                impactRing(cx + 66, 56);
                puff(cx + 66, 58, 1.5);
              })
              // hold the extended kick — a readable pose, not a twitch
              .to(char, { x: "-=12", duration: 0.22, ease: "power2.out" }, "+=0.3")
              .add(() => {
                gsap.set(kickG, { autoAlpha: 0 });
                gsap.set(standG, { autoAlpha: 1 });
              })
              .to(flip, {
                scaleY: 0.9,
                y: 3,
                duration: 0.1,
                ease: "power2.in",
              })
              .to(flip, { scaleY: 1, y: 0, rotation: 0, duration: 0.28, ease: "back.out(2)" })
              // Job done — fold into flight and take off on patrol
              .add(() => {
                foldTo("cruise", () => {
                  introDone = true;
                  patrol.play();
                });
              }, "+=0.25"),
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
          // The punch (card-stub) is thrown at the card's RIGHT EDGE so the
          // strike visibly torques it into the spin; the torch scan
          // (cv-artifact) hovers BESIDE the CV's right edge; everything
          // else hovers at the element's center
          const anchorX =
            zone === "card-stub"
              ? rect.right - CHAR_W * 0.15
              : zone === "cv-artifact"
                ? rect.right + 12
                : rect.left + rect.width / 2 - CHAR_W / 2;
          const targetX = Math.min(
            Math.max(anchorX, 8),
            root.clientWidth - CHAR_W - 8,
          );
          // The torch scan starts level with the CV's TOP edge (it will
          // ride down the side); every other zone is approached from below,
          // the paper's top edge kissing the element's bottom
          const desiredBottom =
            zone === "cv-artifact"
              ? rect.top + 66
              : Math.min(rect.bottom + 34, rootRect.bottom - 4);
          const targetY = Math.max(
            desiredBottom - rootRect.bottom,
            150 - rootRect.bottom, // never higher than just below the navbar
          );
          // Scanner end point: level with the CV's bottom edge
          const scanEndY = Math.min(
            rect.bottom + 26 - rootRect.bottom,
            -20,
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

          const currentX = Number(gsap.getProperty(char, "x"));
          const flightDir = targetX > currentX ? 1 : -1;

          // Organic flight paths instead of straight tweens:
          // ascent = quadratic bezier swoop (peaks above the target) with a
          // decaying perpendicular wobble; descent = the same paper-fall
          // sway physics as the intro drop (integer sway count so it lands
          // exactly on targetX).
          const controlX = (currentX + targetX) / 2;
          const controlY = targetY - 85;
          const ascend = { t: 0 };

          // Zone-specific gesture at the moment of contact
          const gesture =
            zone === "card-stub"
              ? "punch"
              : zone === "cv-artifact"
                ? "torch"
                : zone === "hero-rows"
                  ? "snap"
                  : "tap";

          // completion (patrol resume etc.) happens in the sim's landing
          // chain — the timeline itself ends when the sheet is let go
          const tl = gsap.timeline();

          // Arriving in superman cruise: level out of the flight attitude
          // into the upright character before the wind-up
          if (pose === "cruise") {
            const arriveFacing =
              Math.sign(Number(gsap.getProperty(flip, "scaleX"))) || 1;
            tl.to(flip, {
              scaleX: 0.12 * arriveFacing,
              y: 0,
              rotation: 0,
              duration: 0.13,
              ease: "power2.in",
            })
              .add(() => {
                setPose("stand");
                exitCruiseAttitude();
              })
              .to(flip, {
                scaleX: arriveFacing,
                duration: 0.18,
                ease: "back.out(2)",
              });
          }

          tl
            // Anticipation: crouch, eyes lock onto the target, then launch
            .to(flip, { scaleY: 0.8, y: 6, duration: 0.16, ease: "power2.in" })
            .add(() =>
              gsap.to(pupils, {
                x: flightDir * 2.2,
                y: -1.6,
                duration: 0.2,
                overwrite: "auto",
              }),
            )
            .to(flip, {
              scaleY: 1.06,
              y: -12,
              duration: 0.18,
              ease: "power2.out",
            })
            .to(flip, { scaleY: 1, duration: 0.2 }, "<0.08")
            // SUPERMAN: body tips horizontal into the flight direction, the
            // leading arm punches out past the head, the cape streams back
            // (facing is set explicitly — the tick won't flip it mid-visit)
            .set(flip, {
              transformOrigin: "50% 55%",
              scaleX: flightDir < 0 ? -1 : 1,
            })
            .to(
              arm,
              {
                rotation: -158,
                transformOrigin: "top center",
                duration: 0.28,
                ease: "power2.out",
              },
              "<",
            )
            .to(cape, { rotation: 32, scaleY: 1.26, duration: 0.3 }, "<")
            .to(
              cape,
              {
                rotation: 20,
                duration: 0.16,
                yoyo: true,
                repeat: 7,
                ease: "sine.inOut",
              },
              "<0.3",
            )
            // Swooping ascent along the bezier, wobble fading as it homes in
            .to(
              ascend,
              {
                t: 1,
                duration: 1.25,
                ease: "power1.inOut",
                onUpdate: () => {
                  const t = ascend.t;
                  const inv = 1 - t;
                  const bezierX =
                    inv * inv * currentX + 2 * inv * t * controlX + t * t * targetX;
                  const bezierY = 2 * inv * t * controlY + t * t * targetY;
                  const wobble = Math.sin(t * Math.PI * 3.2) * 12 * inv;
                  gsap.set(char, {
                    x: bezierX + wobble * 0.35,
                    y: bezierY + wobble,
                  });
                  // horizontal superman pose + a light aerodynamic rock;
                  // eases back toward upright as it arrives
                  gsap.set(flip, {
                    rotation:
                      76 * flightDir * (0.25 + inv * 0.75) +
                      Math.cos(t * Math.PI * 3.2) * 7 * inv,
                  });
                },
              },
              "<",
            )
            // Arrive: swing upright, cape settles, arm comes down
            .to(flip, { rotation: 0, duration: 0.22, ease: "back.out(1.8)" })
            .to(cape, { rotation: 0, scaleY: 1, duration: 0.3, overwrite: "auto" }, "<")
            .to(arm, { rotation: 0, duration: 0.2 }, "<");

          // ---- Contact gesture (the zone event fires mid-gesture) ----
          const touch = () => {
            window.dispatchEvent(
              new CustomEvent(MASCOT_ZONE_EVENT, { detail: { zone } }),
            );
            puff(targetX + CHAR_W / 2, targetY + 4, 1.2);
          };

          if (gesture === "punch") {
            // Square up to the card (it's on the left), WIND UP — torso
            // twists away, fist cocked, a beat of anticipation — then a
            // straight cross into the card's edge. The zone event fires on
            // the exact impact frame; the reaction shoves the mascot back.
            const punchX = targetX - 10;
            const punchY = targetY + 42;
            tl.set(flip, { scaleX: -1 })
              .to(flip, { rotation: 10, duration: 0.24, ease: "power2.out" })
              .to(char, { x: "+=9", duration: 0.24, ease: "power2.out" }, "<")
              .to(
                arm,
                {
                  rotation: 42,
                  transformOrigin: "top center",
                  duration: 0.22,
                  ease: "power2.out",
                },
                "<",
              )
              .to(flip, { scaleY: 0.93, duration: 0.12, ease: "power2.in" }, "<0.1")
              // ...hold the wind-up for a beat...
              .to(flip, { rotation: 12, duration: 0.18, ease: "sine.inOut" }, "+=0.15")
              // STRIKE
              .to(char, { x: "-=32", duration: 0.09, ease: "power4.in" })
              .to(
                flip,
                { rotation: -7, scaleY: 1.03, duration: 0.09, ease: "power4.in" },
                "<",
              )
              .to(
                arm,
                { rotation: -96, duration: 0.07, ease: "power4.in" },
                "<",
              )
              .add(() => {
                window.dispatchEvent(
                  new CustomEvent(MASCOT_ZONE_EVENT, { detail: { zone } }),
                );
                impactRing(punchX, punchY);
                puff(punchX, punchY, 1.7);
              })
              // Recoil: Newton pushes back — shoved away, wobbling
              .to(char, { x: "+=23", duration: 0.55, ease: "power3.out" })
              .to(
                flip,
                { rotation: 7, duration: 0.45, ease: "elastic.out(1, 0.4)" },
                "<",
              )
              .to(arm, { rotation: 0, duration: 0.3, ease: "power2.inOut" }, "<0.12")
              .to(flip, { rotation: 0, duration: 0.35, ease: "sine.out" })
              // Eyes chase the card whirling around in front of it
              .to(pupils, {
                x: -2.2,
                duration: 0.32,
                yoyo: true,
                repeat: 5,
                ease: "sine.inOut",
              });
          } else if (gesture === "torch") {
            // Beside the CV's right edge: face the page, switch the torch
            // on (beam shines sideways onto it), then RIDE DOWN the edge —
            // the lit band sweeps the document top-to-bottom like a
            // scanner head. The zone event fires as the light hits.
            tl.set(flip, { scaleX: -1 })
              .to(torch, { opacity: 1, duration: 0.18 })
              .add(() => {
                window.dispatchEvent(
                  new CustomEvent(MASCOT_ZONE_EVENT, { detail: { zone } }),
                );
                puff(targetX - 12, targetY + 52, 1.1);
              })
              .to(char, {
                y: scanEndY,
                duration: 1.9,
                ease: "sine.inOut",
              })
              .to(torch, { opacity: 0, duration: 0.25 })
              .set(flip, { scaleX: 1 });
          } else if (gesture === "snap") {
            // Snap the fingers — spark! — the rows light up, then strike
            // the Mbappé celebration: shades drop on, arms fold across the
            // belly, a cocky lean-back, hold... and release.
            tl.to(arm, {
              rotation: -128,
              transformOrigin: "top center",
              duration: 0.16,
              ease: "power3.out",
            })
              .add(touch)
              .to(spark, { opacity: 1, scale: 1.7, duration: 0.12, ease: "power2.out" })
              .to(spark, { opacity: 0, scale: 0.5, duration: 0.28 })
              .to(arm, { rotation: 0, duration: 0.22 }, "<")
              // celebration: shades slide down from above the eyes
              .fromTo(
                shades,
                { opacity: 0, y: -9 },
                { opacity: 1, y: 0, duration: 0.24, ease: "back.out(2.2)" },
              )
              .set(arm, { opacity: 0 })
              .to(armsCrossed, { opacity: 1, duration: 0.14 }, "<")
              .to(flip, { rotation: -5, duration: 0.25, ease: "power2.out" }, "<")
              // proud little chest bob while holding the stance
              .to(flip, {
                y: -3,
                duration: 0.4,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
              })
              // release the pose
              .to(shades, { opacity: 0, y: -8, duration: 0.2 }, "+=0.5")
              .to(armsCrossed, { opacity: 0, duration: 0.15 }, "<")
              .set(arm, { opacity: 1 })
              .to(flip, { rotation: 0, duration: 0.22 }, "<");
          } else {
            // Default: lunge in and tap
            tl.to(flip, { y: -10, duration: 0.12, ease: "power3.out" })
              .add(touch)
              .to(flip, {
                rotation: -14,
                y: -4,
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
              });
          }

          // Delighted double-hop — except after the snap, where the Mbappé
          // celebration IS the celebration
          if (gesture !== "snap") {
            tl.to(flip, {
              y: -7,
              duration: 0.14,
              ease: "power2.out",
              yoyo: true,
              repeat: 3,
            });
          }

          // Touchdown continuation: squash scaled by impact, then fold
          // into flight and glide home. The heading MUST match the actual
          // glide direction — facing is frozen during visits and gestures
          // may have left scaleX pointing anywhere (the punch squares up
          // backwards): nobody flies backwards.
          const visitLand = (impact: number, landX: number) => {
            gsap
              .timeline()
              .add(() => {
                gsap.killTweensOf(fallCape);
                gsap.set(fallCape, { rotation: 0, scaleY: 1 });
                gsap.set(fallG, { rotation: 0, scaleY: 1 });
                setPose("stand");
                puff(landX + CHAR_W / 2, 84, impact);
              })
              .to(flip, {
                scaleY: Math.max(0.68, 0.92 - impact * 0.15),
                y: 4,
                rotation: 0,
                transformOrigin: "50% 100%",
                duration: 0.14,
                ease: "power2.in",
              })
              .to(flip, { scaleY: 1, y: 0, duration: 0.3, ease: "back.out(2.5)" })
              .add(() => {
                dangle.kill();
                gsap.set([legL, legR], { rotation: 0 });
                gsap.to(pupils, { x: 0, y: 0, duration: 0.3 });
                const homeDir = Math.sign(currentX - landX) || 1;
                facing = homeDir;
                gsap.set(flip, { scaleX: homeDir });
                foldTo("cruise");
              }, "+=0.1")
              .to(
                char,
                {
                  x: currentX,
                  duration: Math.min(
                    1.3,
                    Math.abs(landX - currentX) / 260 + 0.25,
                  ),
                  ease: "none",
                  onComplete: () => {
                    patrol.resume();
                    visiting = false;
                  },
                },
                "+=0.35",
              );
          };

          tl
            // Let go: swap to the falling-sheet pose — from here the
            // physics simulation owns the descent
            .add(() => {
              setPose("fall");
              gsap.to(fallCape, {
                rotation: 8,
                scaleY: 1.1,
                duration: 0.24,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              });
              paperFallSim({
                x: Number(gsap.getProperty(char, "x")),
                y: Number(gsap.getProperty(char, "y")),
                vx: (Math.random() - 0.5) * 140,
                onLand: visitLand,
              });
            }, "+=0.45");
        };

        // Face the walking direction + visit any zone we walk under.
        // Hero zones follow a fixed ROUTINE so the show has a narrative —
        // punch the card, walk, scan the CV, walk, snap at the rows, loop —
        // instead of re-punching the card on every pass. Zones outside the
        // routine (rag-graph, hero-stamp) stay opportunistic.
        const ROUTINE = ["card-stub", "cv-artifact", "hero-rows"];
        let routineIndex = 0;
        let lastX = 0;
        let lastZoneScan = 0;
        const zoneCooldown = new Map<string, number>();
        let facing = 1;
        let flipping = false; // click somersault in progress
        const tick = () => {
          const x = Number(gsap.getProperty(char, "x"));
          const dx = x - lastX;
          // While visiting or folding, facing is choreographed (e.g.
          // squared up to the card) — movement must not flip it mid-gesture
          if (!visiting && !folding && Math.abs(dx) > 0.1) {
            const dir = dx > 0 ? 1 : -1;
            if (dir !== facing) {
              facing = dir;
              if (pose === "cruise") {
                // WINGOVER — the turnaround flies around an imaginary
                // circle: a half-loop whose body stays TANGENT to the arc
                // the whole way (climb curving forward, vertical at the
                // side, curling back over the top), the mirror flip hidden
                // at the vertical moment, then a glide back down to cruise
                // height already heading the other way.
                folding = true;
                patrol.pause();
                const oldD = -dir;
                const entryX = Number(gsap.getProperty(char, "x"));
                const r = 46;
                const arc = { th: 0 };
                let mirrored = false;
                gsap
                  .timeline({
                    onComplete: () => {
                      folding = false;
                      patrol.resume();
                    },
                  })
                  .to(arc, {
                    th: Math.PI,
                    duration: 1.05,
                    ease: "sine.inOut",
                    onUpdate: () => {
                      const th = arc.th;
                      gsap.set(char, {
                        x: entryX + oldD * Math.sin(th) * r,
                        y: -(r - Math.cos(th) * r),
                      });
                      // tangent heading: level → vertical → level reversed;
                      // the facing flip happens at the vertical instant,
                      // where the mirrored art lines up with itself
                      if (th <= Math.PI / 2) {
                        gsap.set(flip, {
                          rotation: oldD * 76 * Math.cos(th),
                          y: 0,
                        });
                      } else {
                        if (!mirrored) {
                          mirrored = true;
                          gsap.set(flip, { scaleX: dir });
                        }
                        gsap.set(flip, {
                          rotation: dir * 76 * -Math.cos(th),
                          y: 0,
                        });
                      }
                    },
                  })
                  // glide back down from the top of the loop to cruise
                  // level (x stays on the entry point so the patrol resumes
                  // seamlessly from where it paused)
                  .to(char, { y: 0, duration: 0.55, ease: "power1.in" });
              } else {
                gsap.set(flip, { scaleX: dir });
              }
            }
          }
          lastX = x;

          // Cruise physics: superman flight porpoises — it trades height
          // for speed on a gentle sine, and the PITCH modulates around the
          // horizontal attitude following the slope (nose up climbing,
          // down diving). Hovers ~12px above the bar on ground effect.
          if (pose === "cruise" && !folding && !flipping) {
            const tAir = performance.now() / 1000;
            gsap.set(flip, {
              y: -12 + Math.sin(tAir * 2.3) * 5,
              rotation: facing * (76 + Math.cos(tAir * 2.3) * 7),
            });
          }

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
            const seqPos = ROUTINE.indexOf(zone);
            if (seqPos !== -1 && seqPos !== routineIndex) {
              continue; // routine zone, but it's not its turn yet
            }
            if (seqPos !== -1) {
              routineIndex = (routineIndex + 1) % ROUTINE.length;
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

          // While visiting, the eyes stay locked on the flight target
          if (!visiting) {
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
          }

          if (dist < 110 && !alerted && !visiting && !folding) {
            alerted = true;
            patrol.pause();
            gsap.set([legL, legR], { rotation: 0 });
            // startled mid-flight: pop out of the plane fold, then the
            // classic squash-stretch jump
            const startleHop = () => {
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
            };
            if (pose === "cruise") {
              foldTo("stand", startleHop);
            } else {
              startleHop();
            }
          } else if (dist > 190 && alerted && !folding) {
            alerted = false;
            // calm again: fold back into the plane and resume the patrol
            if (pose === "stand") {
              foldTo("cruise", () => patrol.resume());
            } else {
              patrol.resume();
            }
          }
        };
        window.addEventListener("pointermove", onPointerMove);

        // Click: somersault (suppressed right after a drag)
        const onClick = () => {
          if (flipping || visiting || wasDragged) {
            wasDragged = false;
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

        // ---- Drag & drop: grab the paper — it dangles from the cursor,
        // swinging like a sheet held by its top edge (pendulum follows the
        // drag momentum) — and when released from height it falls with the
        // full paper physics, then flies home and resumes patrolling. ----
        char.style.touchAction = "none";
        let dragging = false;
        let wasDragged = false;
        let dragDangle: ReturnType<typeof gsap.to> | null = null;
        let grabPatrolX = 0;
        let lastClientX = 0;
        let lastClientY = 0;
        let lastMoveTime = 0;
        let throwVX = 0; // smoothed release velocity (px/s) — a fling throws it
        let throwVY = 0;

        const onGrab = (event: PointerEvent) => {
          if (!introDone || visiting || folding || flipping || dragging) {
            return;
          }
          dragging = true;
          wasDragged = false;
          visiting = true; // busy-guard: no zones, no startle, facing frozen
          patrol.pause();
          grabPatrolX = Number(gsap.getProperty(char, "x"));
          lastClientX = event.clientX;
          lastClientY = event.clientY;
          lastMoveTime = event.timeStamp;
          throwVX = 0;
          throwVY = 0;
          if (pose === "cruise") {
            exitCruiseAttitude();
          }
          // dedicated grabbed pose: pinched at the top edge — the pendulum
          // must swing from the GRIP, so the pivot moves to the pinch point
          setPose("grab");
          gsap.set(flip, {
            transformOrigin: "50% 4%",
            scaleX: Math.sign(Number(gsap.getProperty(flip, "scaleX"))) || 1,
          });
          gsap.to(flip, { rotation: 0, y: 0, duration: 0.15, overwrite: "auto" });
          // startled little jolt as it's snatched
          gsap.fromTo(
            grabG,
            { scale: 0.92, transformOrigin: "50% 8%" },
            { scale: 1, duration: 0.3, ease: "back.out(3)" },
          );
          // limp legs swing gently under it
          dragDangle = gsap.to(grabLegs, {
            rotation: 5,
            transformOrigin: "top center",
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
          // a sweat drop beads off every second or so
          gsap.fromTo(
            grabSweat,
            { y: 0, opacity: 0 },
            {
              keyframes: [
                { opacity: 0.55, y: 3, duration: 0.3 },
                { opacity: 0, y: 10, duration: 0.5 },
              ],
              repeat: -1,
              repeatDelay: 0.7,
            },
          );
          document.body.style.cursor = "grabbing";
          event.preventDefault();
        };

        const onDragMove = (event: PointerEvent) => {
          if (!dragging) {
            return;
          }
          wasDragged = true;
          const rootRect = root.getBoundingClientRect();
          const x = Math.min(
            Math.max(event.clientX - CHAR_W / 2, 8),
            root.clientWidth - CHAR_W - 8,
          );
          // held by the top edge, ~12px below the cursor
          const y = Math.min(
            Math.max(
              event.clientY + 12 - rootRect.bottom + 88,
              80 - rootRect.bottom,
            ),
            0,
          );
          gsap.to(char, { x, y, duration: 0.18, ease: "power2.out", overwrite: "auto" });
          // pendulum: the sheet trails against the drag direction
          const vx = event.clientX - lastClientX;
          // smoothed pointer velocity → initial conditions when released
          const dtMove = Math.max((event.timeStamp - lastMoveTime) / 1000, 0.004);
          throwVX = throwVX * 0.65 + ((event.clientX - lastClientX) / dtMove) * 0.35;
          throwVY = throwVY * 0.65 + ((event.clientY - lastClientY) / dtMove) * 0.35;
          lastClientX = event.clientX;
          lastClientY = event.clientY;
          lastMoveTime = event.timeStamp;
          gsap.to(flip, {
            rotation: Math.max(-38, Math.min(38, -vx * 2.2)),
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const onRelease = () => {
          if (!dragging) {
            return;
          }
          dragging = false;
          dragDangle?.kill();
          dragDangle = null;
          gsap.killTweensOf(grabSweat);
          gsap.set(grabSweat, { opacity: 0, y: 0 });
          gsap.set(grabLegs, { rotation: 0 });
          gsap.set([legL, legR], { rotation: 0 });
          document.body.style.cursor = "";

          const dropX = Number(gsap.getProperty(char, "x"));
          const dropY = Number(gsap.getProperty(char, "y"));

          // after settling on the floor: fly back to the patrol position
          const goHome = () => {
            const landX = Number(gsap.getProperty(char, "x"));
            const homeDir = Math.sign(grabPatrolX - landX) || 1;
            facing = homeDir;
            gsap.set(flip, { scaleX: homeDir });
            foldTo("cruise", () => {
              gsap.to(char, {
                x: grabPatrolX,
                duration: Math.min(
                  1.4,
                  Math.abs(grabPatrolX - landX) / 260 + 0.25,
                ),
                ease: "none",
                onComplete: () => {
                  visiting = false;
                  patrol.resume();
                },
              });
            });
          };

          if (dropY < -40) {
            // dropped (or THROWN — the release velocity carries) from
            // height: the physics sim owns the fall
            gsap.to(flip, { rotation: 0, duration: 0.12, overwrite: "auto" });
            setPose("fall");
            gsap.to(fallCape, {
              rotation: 8,
              scaleY: 1.1,
              duration: 0.24,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
            });
            paperFallSim({
              x: dropX,
              y: dropY,
              vx: Math.max(-520, Math.min(520, throwVX)),
              vy: Math.max(-320, Math.min(320, throwVY)),
              onLand: (impact, landX) => {
                gsap
                  .timeline()
                  .add(() => {
                    gsap.killTweensOf(fallCape);
                    gsap.set(fallCape, { rotation: 0, scaleY: 1 });
                    gsap.set(fallG, { rotation: 0, scaleY: 1 });
                    setPose("stand");
                    puff(landX + CHAR_W / 2, 84, impact);
                  })
                  .to(flip, {
                    scaleY: Math.max(0.68, 0.92 - impact * 0.15),
                    y: 4,
                    rotation: 0,
                    transformOrigin: "50% 100%",
                    duration: 0.14,
                    ease: "power2.in",
                  })
                  .to(flip, {
                    scaleY: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "back.out(2.5)",
                  })
                  .add(goHome, "+=0.25");
              },
            });
          } else {
            // released near the floor: pop out of the grabbed pose, settle
            gsap
              .timeline()
              .add(() => {
                setPose("stand");
                gsap.set(flip, { transformOrigin: "50% 100%" });
              })
              .to(char, { y: 0, duration: 0.2, ease: "power2.in" })
              .to(flip, { rotation: 0, duration: 0.2 }, "<")
              .to(flip, { scaleY: 0.88, y: 3, duration: 0.1, ease: "power2.in" })
              .to(flip, { scaleY: 1, y: 0, duration: 0.25, ease: "back.out(2)" })
              .add(goHome, "+=0.15");
          }
        };

        char.addEventListener("pointerdown", onGrab);
        window.addEventListener("pointermove", onDragMove);
        window.addEventListener("pointerup", onRelease);
        window.addEventListener("pointercancel", onRelease);

        return () => {
          gsap.ticker.remove(tick);
          activeSims.forEach((removeSim) => removeSim());
          activeSims.clear();
          window.removeEventListener("pointermove", onPointerMove);
          char.removeEventListener("click", onClick);
          char.removeEventListener("pointerdown", onGrab);
          window.removeEventListener("pointermove", onDragMove);
          window.removeEventListener("pointerup", onRelease);
          window.removeEventListener("pointercancel", onRelease);
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
      className="pointer-events-none fixed inset-x-0 bottom-[34px] z-[90] hidden h-24 md:block"
    >
      <div
        ref={charRef}
        className="pointer-events-auto absolute bottom-0 cursor-pointer select-none"
        style={{ width: 64, height: 88 }}
      >
        {/* overflow-visible everywhere: rotated poses (superman flight,
            horizontal paper-fall) swing the artwork outside the 64×88 box —
            the svg viewport must never clip the head/cape */}
        <div className="m-flip origin-bottom">
          <svg
            width="64"
            height="88"
            viewBox="0 0 64 88"
            fill="none"
            className="overflow-visible"
          >
            {/* ===== FALLING POSE — a dedicated asset, not the standing
                 art rotated: a horizontal sheet bowed into a gentle U by
                 air resistance (real dropped paper flexes like this), eyes
                 peeking over the edge, cape dragged upward, feet trailing.
                 Swapped in during paperFall, back out on landing. ===== */}
            <g className="m-fall" opacity="0">
              {/* air rush lines above the sheet — fade in during the dive,
                  gone at the stalls (opacity driven from paperFall) */}
              <g className="m-fall-lines" opacity="0">
                <path
                  d="M12 24 q 3 -9 1 -17"
                  stroke="rgba(17,17,17,0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M32 20 q 2 -8 0 -15"
                  stroke="rgba(17,17,17,0.3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M52 24 q 3 -9 1 -17"
                  stroke="rgba(17,17,17,0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              {/* slim cape ribbon trailing up — small, so the PAPER stays
                  the star of the silhouette */}
              <path
                className="m-fall-cape"
                d="M28 32 C 26 22 27 14 31 7 Q 33 12 35 8 Q 36 14 39 11 C 40 19 38 26 36 32 Z"
                fill={INK}
                opacity="0.85"
              />
              {/* the sheet itself: a full landscape page with its content
                  clearly visible — unmistakably a piece of paper */}
              <rect
                x="2"
                y="30"
                width="60"
                height="38"
                rx="6"
                fill={CREAM}
                stroke={INK}
                strokeWidth="3"
              />
              {/* folded corner */}
              <path d="M49 31.5 L60.5 43 L49 43 Z" fill={INK} />
              {/* score sticker */}
              <circle
                cx="11"
                cy="39"
                r="4.5"
                fill="#CAFF43"
                stroke={INK}
                strokeWidth="2"
              />
              {/* face — mouth a little "o" (whee!) */}
              <circle
                cx="26"
                cy="43"
                r="5"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.4"
              />
              <circle
                cx="40"
                cy="43"
                r="5"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.4"
              />
              <circle cx="26.5" cy="44.6" r="2" fill={INK} />
              <circle cx="40.5" cy="44.6" r="2" fill={INK} />
              <circle
                cx="33"
                cy="53"
                r="2.2"
                stroke={INK}
                strokeWidth="2"
                fill="none"
              />
              {/* CV text lines */}
              <rect
                x="10"
                y="58.5"
                width="24"
                height="3"
                rx="1.5"
                fill="rgba(17,17,17,0.28)"
              />
              <rect
                x="38"
                y="58.5"
                width="15"
                height="3"
                rx="1.5"
                fill="rgba(17,17,17,0.18)"
              />
            </g>

            {/* ===== KICK POSE — a proper flying side-kick for the intro:
                 body leaning back over the support leg, kicking leg fully
                 extended into the card, arms flung for balance, determined
                 brows, cape whipped back ===== */}
            <g className="m-kick" opacity="0">
              {/* cape whipped back by the strike */}
              <path
                d="M10 24 C 0 27 -6 34 -13 30 Q -5 40 -13 46 C -3 48 5 42 13 41 Z"
                fill={INK}
                opacity="0.88"
              />
              {/* support leg planted under the lean */}
              <rect
                x="19"
                y="62"
                width="3.6"
                height="18"
                rx="1.8"
                fill={INK}
                transform="rotate(12 21 62)"
              />
              <ellipse cx="18" cy="81" rx="6" ry="3" fill={INK} />
              {/* kicking leg: fully extended forward */}
              <rect
                x="33"
                y="56"
                width="28"
                height="4.2"
                rx="2.1"
                fill={INK}
                transform="rotate(-13 33 58)"
              />
              <ellipse
                cx="63"
                cy="50"
                rx="6.5"
                ry="3.4"
                fill={INK}
                transform="rotate(-13 63 50)"
              />
              {/* arms flung for balance */}
              <rect
                x="0"
                y="24"
                width="15"
                height="3.4"
                rx="1.7"
                fill={INK}
                transform="rotate(-36 2 26)"
              />
              <rect
                x="42"
                y="17"
                width="15"
                height="3.4"
                rx="1.7"
                fill={INK}
                transform="rotate(26 44 19)"
              />
              {/* body sheet leaning back into the kick */}
              <g transform="rotate(-14 28 40)">
                <rect
                  x="4"
                  y="6"
                  width="48"
                  height="58"
                  rx="8"
                  fill={CREAM}
                  stroke={INK}
                  strokeWidth="3"
                />
                <path d="M38 7 L51 20 L38 20 Z" fill={INK} />
                <circle
                  cx="13"
                  cy="15"
                  r="4.5"
                  fill="#CAFF43"
                  stroke={INK}
                  strokeWidth="2"
                />
                {/* determined eyes + angry brows */}
                <circle
                  cx="22"
                  cy="31"
                  r="5.4"
                  fill="#FFFFFF"
                  stroke={INK}
                  strokeWidth="2.4"
                />
                <circle
                  cx="37"
                  cy="31"
                  r="5.4"
                  fill="#FFFFFF"
                  stroke={INK}
                  strokeWidth="2.4"
                />
                <circle cx="23.5" cy="31.5" r="2" fill={INK} />
                <circle cx="38.5" cy="31.5" r="2" fill={INK} />
                <path
                  d="M16 24.5 l9 3 M44 27.5 l-9 -3"
                  stroke={INK}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* gritted mouth */}
                <path
                  d="M26 42 h8"
                  stroke={INK}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <rect
                  x="12"
                  y="50"
                  width="22"
                  height="3"
                  rx="1.5"
                  fill="rgba(17,17,17,0.25)"
                />
              </g>
            </g>

            {/* ===== GRABBED POSE — pinched by the cursor at the top edge:
                 the paper gathers into creases at the grip, the body hangs
                 buckled, wide eyes dart up at whatever grabbed it, limp
                 arms and legs dangle, a sweat drop beads off ===== */}
            <g className="m-grab" opacity="0">
              {/* limp arms hanging at the sides (behind the sheet) */}
              <rect
                x="9.5"
                y="28"
                width="3.2"
                height="15"
                rx="1.6"
                fill={INK}
                transform="rotate(7 11 28)"
              />
              <rect
                x="51.5"
                y="28"
                width="3.2"
                height="15"
                rx="1.6"
                fill={INK}
                transform="rotate(-7 53 28)"
              />
              {/* limp dangling legs */}
              <g className="m-grab-legs">
                <rect x="24" y="64" width="3.4" height="16" rx="1.7" fill={INK} />
                <ellipse cx="26" cy="81.5" rx="5.5" ry="2.8" fill={INK} />
                <rect x="37" y="64" width="3.4" height="16" rx="1.7" fill={INK} />
                <ellipse cx="39" cy="81.5" rx="5.5" ry="2.8" fill={INK} />
              </g>
              {/* buckled sheet hanging from the pinch point */}
              <path
                d="M32 5
                   C 23 7 15 11 13 20
                   C 9 32 13 46 10 58
                   C 15 67 24 64 32 66
                   C 40 64 49 67 54 58
                   C 51 46 55 32 51 20
                   C 49 11 41 7 32 5 Z"
                fill={CREAM}
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* creases gathering into the grip */}
              <path
                d="M32 6 L23 17 M32 6 L32 19 M32 6 L41 17"
                stroke={INK}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.45"
              />
              {/* score sticker */}
              <circle
                cx="19"
                cy="26"
                r="4.2"
                fill="#CAFF43"
                stroke={INK}
                strokeWidth="2"
              />
              {/* wide startled eyes, pupils darting UP at the grip */}
              <circle
                cx="25"
                cy="36"
                r="5.6"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.4"
              />
              <circle
                cx="41"
                cy="36"
                r="5.6"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="2.4"
              />
              <circle cx="25.5" cy="33.6" r="2" fill={INK} />
              <circle cx="41.5" cy="33.6" r="2" fill={INK} />
              {/* worried wobbly mouth */}
              <path
                d="M27 48 q 2.5 -2.5 5 0 q 2.5 2.5 5 0"
                stroke={INK}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* CV lines, skewed by the buckling */}
              <rect
                x="16"
                y="54"
                width="20"
                height="3"
                rx="1.5"
                fill="rgba(17,17,17,0.25)"
                transform="rotate(-3 26 55)"
              />
              {/* sweat drop beading off */}
              <path
                className="m-grab-sweat"
                d="M52 24 q 3.6 5.2 0 7.8 q -3.6 -2.6 0 -7.8 Z"
                fill={INK}
                opacity="0"
              />
            </g>

            {/* ===== STANDING POSE (walking / flying / gesturing) ===== */}
            <g className="m-stand">
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

            {/* Flashlight held out FORWARD (facing direction) — the mascot
                hovers beside the CV and rides down its edge, the horizontal
                yellow beam sweeping the page top-to-bottom like a scanner
                head. Drawn pointing +x; the facing flip mirrors it. */}
            <g className="m-torch" opacity="0">
              {/* ONE beam cone with a gradient — bright at the lens,
                  dissolving over the page. Two stacked polygons read as a
                  "double laser" (four visible edges), so: single shape. */}
              <defs>
                <linearGradient
                  id="m-torch-beam"
                  gradientUnits="userSpaceOnUse"
                  x1="62"
                  y1="44"
                  x2="380"
                  y2="44"
                >
                  <stop offset="0" stopColor="rgba(255,232,130,0.55)" />
                  <stop offset="0.45" stopColor="rgba(255,220,90,0.3)" />
                  <stop offset="1" stopColor="rgba(255,220,90,0)" />
                </linearGradient>
              </defs>
              <polygon
                points="62,39 380,-8 380,96 62,49"
                fill="url(#m-torch-beam)"
              />
              {/* hot glow right at the lens (source brightness, not a
                  second cone) */}
              <ellipse
                cx="66"
                cy="44"
                rx="7"
                ry="9"
                fill="rgba(255,238,150,0.5)"
              />
              {/* torch: ink body, white grip band, wider head, cream lens */}
              <rect x="41" y="40" width="13" height="8" rx="2" fill={INK} />
              <rect x="44.5" y="41.5" width="4.5" height="5" rx="1" fill="#FFFFFF" />
              <rect x="54" y="37" width="7.5" height="14" rx="2" fill={INK} />
              <rect
                x="61"
                y="38.5"
                width="2.6"
                height="11"
                rx="1.2"
                fill="#FFF7D6"
              />
            </g>

            {/* Finger-snap spark — flashes when it snaps at the rows */}
            <path
              className="m-spark"
              d="M60 34 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 Z"
              fill="#CAFF43"
              stroke={INK}
              strokeWidth="1.2"
              opacity="0"
            />

            {/* Paper body */}
            <g className="m-body">
              {/* Superhero cape — hangs straight down BEHIND the sheet,
                  from the neck to ~3/4 of the legs, peeking out on both
                  sides, with a cloud/wave scalloped hem */}
              <path
                className="m-cape"
                d="M11 16
                   C 3 28 0 46 2 64
                   Q 4 74 8 67
                   Q 12 77 17 68
                   Q 22 79 27 69
                   Q 32 79 37 69
                   Q 42 78 47 68
                   Q 52 76 56 66
                   C 60 46 59 28 53 16
                   Z"
                fill={INK}
                opacity="0.9"
              />
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

              {/* Black sunglasses — dropped on for the Mbappé celebration */}
              <g className="m-shades" opacity="0">
                <rect x="16.5" y="25" width="14" height="10" rx="3.5" fill={INK} />
                <rect x="33.5" y="25" width="14" height="10" rx="3.5" fill={INK} />
                <rect x="29" y="27.5" width="6" height="2.5" rx="1.25" fill={INK} />
                <rect x="12" y="27" width="5.5" height="2.5" rx="1.25" fill={INK} />
                <rect x="46.5" y="27" width="5.5" height="2.5" rx="1.25" fill={INK} />
                <path
                  d="M19.5 28 l4 0"
                  stroke="rgba(255,255,255,0.65)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </g>

              {/* Arms folded across the belly — the celebration stance */}
              <g className="m-arms-crossed" opacity="0">
                <rect
                  x="11"
                  y="48"
                  width="32"
                  height="6.5"
                  rx="3.25"
                  fill={INK}
                  transform="rotate(11 27 51)"
                />
                <rect
                  x="21"
                  y="48"
                  width="32"
                  height="6.5"
                  rx="3.25"
                  fill={INK}
                  transform="rotate(-11 37 51)"
                />
                <circle cx="44" cy="54.5" r="3.2" fill={INK} />
                <circle cx="20" cy="54.5" r="3.2" fill={INK} />
              </g>

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
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
