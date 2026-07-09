"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { loadGsap } from "@/lib/gsap-loader";
import { RAG_NODES, RAG_OVERVIEW } from "@/lib/rag-node-content";

// Same three.js chunk as the hero — loaded once, shared by both sections
const RagGraph = dynamic(() => import("@/components/landing/rag-graph"), {
  ssr: false,
});

const INK = "#141414";
const CREAM = "#F5F2D8";

/* "How the RAG graph works" — the interactive stage for the graph the hero
   only teases. Zig-zag mirror of the hero: explanation panel on the LEFT,
   full interactive graph on the RIGHT. Clicking a 3D node (or its HTML chip
   twin — the accessible path, and the only path on mobile where the canvas
   is hidden) focuses the camera on that cluster and swaps the panel copy
   with a GSAP transition. */

export default function RagExplainerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  // Scroll-reveal for the whole section
  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: { revert: () => void } | null = null;
    loadGsap().then(({ gsap }) => {
      if (!sectionRef.current) {
        return;
      }
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            ".rag-reveal",
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.12,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
                once: true,
              },
            },
          );
        });
      }, sectionRef);
    });
    return () => ctx?.revert();
  }, []);

  // Panel copy transition on node change (skip the initial mount — the
  // scroll-reveal owns that one)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!panelRef.current) {
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      return;
    }
    let ctx: { revert: () => void } | null = null;
    loadGsap().then(({ gsap }) => {
      if (!panelRef.current) {
        return;
      }
      ctx = gsap.context(() => {
        gsap.fromTo(
          panelRef.current!.children,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.05,
          },
        );
      }, panelRef);
    });
    return () => ctx?.revert();
  }, [selected]);

  const node = selected !== null ? RAG_NODES[selected] : null;

  return (
    <section
      id="rag-explainer"
      ref={sectionRef}
      className="snap-section relative bg-[#F5F2D8]"
      style={{ borderTop: "1px dashed rgba(17,17,17,0.18)" }}
    >
      <div className="flex-1 flex flex-col justify-center overflow-hidden py-12 pl-4 pr-4 md:pl-8 md:pr-8 xl:pr-0">
        {/* ---- Manifesto header — compact version for <lg, where the graph
                column (its real home) is hidden ---- */}
        <div className="rag-reveal mx-auto mb-8 w-full max-w-7xl lg:hidden">
          <p className="mb-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
            <span aria-hidden="true" className="text-[#141414]/30">
              ✦
            </span>
            Powered by RAG
          </p>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[#141414]">
            An AI that actually knows you.
          </h2>
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 xl:mx-0 xl:max-w-none xl:grid-cols-[minmax(0,520px)_1fr]">
          {/* ---- Left: explanation panel ---- */}
          <div className="rag-reveal">
            {/* Node counter */}
            <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
              <span>The graph, node by node</span>
              <span className="h-px flex-1 border-t border-dashed border-[#141414]/20" />
              <span className="font-mono tracking-normal">
                {selected !== null
                  ? `${String(selected + 1).padStart(2, "0")} / 06`
                  : "— / 06"}
              </span>
            </div>

            {/* Node chip nav — accessible twin of the 3D nodes, and the only
                control surface on mobile (canvas is lg+ only) */}
            <div
              className="mb-7 flex flex-wrap gap-2"
              role="tablist"
              aria-label="RAG graph nodes"
            >
              {RAG_NODES.map((item, i) => {
                const active = selected === i;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelected(active ? null : i)}
                    className="rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors duration-200"
                    style={{
                      background: active ? INK : "transparent",
                      color: active ? CREAM : "rgba(17,17,17,0.65)",
                      border: active
                        ? `1px solid ${INK}`
                        : "1px solid rgba(17,17,17,0.3)",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic copy */}
            <div ref={panelRef}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#141414]/45">
                {node ? node.tagline : RAG_OVERVIEW.tagline}
              </p>
              <h3 className="mb-4 font-display text-2xl font-extrabold leading-tight tracking-tight text-[#141414] md:text-3xl">
                {node ? node.title : RAG_OVERVIEW.title}
              </h3>
              <p className="mb-6 max-w-xl text-[15px] leading-relaxed text-[#141414]/65">
                {node ? node.description : RAG_OVERVIEW.description}
              </p>

              {node && (
                <ul className="mb-6 space-y-2.5">
                  {node.subs.map((sub) => (
                    <li key={sub.label} className="flex items-center gap-3">
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
                        style={{
                          background: CREAM,
                          color: "rgba(17,17,17,0.75)",
                          border: "1px solid rgba(17,17,17,0.35)",
                        }}
                      >
                        {sub.label}
                      </span>
                      <span className="text-[13px] text-[#141414]/55">
                        {sub.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="flex items-center gap-2 font-mono text-[11px] text-[#141414]/40">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#CAFF43]"
                  style={{ border: "1px solid rgba(17,17,17,0.4)" }}
                />
                {node ? node.tech : RAG_OVERVIEW.tech}
              </p>
            </div>
          </div>

          {/* ---- Right: manifesto header sitting directly above the full
                  interactive graph, which hugs the right edge of the
                  viewport at xl (mirror of the flush-left hero card) ---- */}
          <div className="rag-reveal hidden lg:block">
            <div className="mb-2 flex items-end justify-between gap-8 xl:pr-8">
              <div>
                <p className="mb-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/40">
                  <span aria-hidden="true" className="text-[#141414]/30">
                    ✦
                  </span>
                  Powered by RAG
                </p>
                <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[#141414] xl:text-4xl">
                  An AI that actually knows you.
                </h2>
              </div>
              <p className="hidden max-w-[220px] pb-1 text-right text-[10px] font-bold uppercase leading-relaxed tracking-[0.25em] text-[#141414]/40 xl:block">
                Every node in this graph is you — click one
              </p>
            </div>

            <div className="relative h-[440px] xl:h-[520px]">
              {/* Typographic watermark behind the graph */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
              >
                <span
                  className="select-none whitespace-nowrap font-display font-black uppercase tracking-tight"
                  style={{
                    fontSize: "clamp(72px, 10vw, 170px)",
                    WebkitTextStroke: "2px rgba(17,17,17,0.09)",
                    color: "transparent",
                  }}
                >
                  For You
                </span>
              </div>
              <div className="relative z-10 h-full w-full">
                <RagGraph
                  mode="interactive"
                  selectedIndex={selected}
                  onSelect={setSelected}
                />
              </div>
              <p
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 right-4 z-10 text-[10px] font-bold uppercase tracking-[0.25em] text-[#141414]/30"
              >
                Click any node to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
