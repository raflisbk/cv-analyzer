"use client";

import { useEffect, useRef } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import Link from "next/link";
import { CVBuilderIcon, CVAnalyzerIcon, JobFindingIcon } from "@/components/ui/product-icons";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

const products = [
  {
    id: "cv-builder",
    Icon: CVBuilderIcon,
    iconBg: "bg-[#FF8C42]/15",
    iconColor: "text-[#FF8C42]",
    glowColor: "rgba(255,140,66,0.1)",
    title: "CV Builder",
    description:
      "Create a professional CV from scratch with AI guidance and industry-standard templates.",
    status: "coming-soon" as const,
    href: "/cv-builder",
  },
  {
    id: "cv-analyzer",
    Icon: CVAnalyzerIcon,
    iconBg: "bg-[#CAFF43]/15",
    iconColor: "text-[#CAFF43]",
    glowColor: "rgba(202,255,67,0.1)",
    title: "CV Analyzer",
    description:
      "Upload your CV for AI-powered scoring across clarity, impact, ATS compatibility, and keyword relevance.",
    status: "active" as const,
    href: "/cv-analyzer",
  },
  {
    id: "job-finding",
    Icon: JobFindingIcon,
    iconBg: "bg-[#8B5CF6]/15",
    iconColor: "text-[#8B5CF6]",
    glowColor: "rgba(139,92,246,0.1)",
    title: "Job Finding",
    description:
      "Discover roles that match your skills and experience with intelligent job recommendations.",
    status: "coming-soon" as const,
    href: "/job-finding",
  },
];

export default function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".products-heading",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".products-heading",
              start: "top 85%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          ".product-card",
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".product-card",
              start: "top 85%",
              once: true,
            },
          }
        );
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="snap-section"
      style={{
        background: "linear-gradient(180deg, #1A170F 0%, #16130C 100%)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-8 w-full">
          <div className="products-heading mb-10 text-center">
            <h2 className="mb-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F2D8]">
              What <PathkrInline variant="dark" /> Offers
            </h2>
            <p className="text-base md:text-lg font-medium tracking-wide text-[#F5F2D8]/50">
              Three tools. One career platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse at top, ${product.glowColor} 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${product.iconBg}`}
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <product.Icon size={28} className={product.iconColor} />
                    </div>

                    <div>
                      {product.status === "active" ? (
                        <AccentPill color="lime" size="sm">Active</AccentPill>
                      ) : (
                        <span
                          className="rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase"
                          style={{
                            background: "rgba(245,242,216,0.06)",
                            color: "rgba(245,242,216,0.4)",
                          }}
                        >
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-[#F5F2D8]">
                    {product.title}
                  </h3>

                  <p className="mb-5 min-h-[48px] text-[14px] leading-relaxed text-[#F5F2D8]/60">
                    {product.description}
                  </p>

                  <div>
                    <Link
                      href={product.href!}
                      className={`inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider transition-all duration-200 ${
                        product.status === "active"
                          ? "text-[#CAFF43] hover:text-[#CAFF43]/80 group-hover:gap-2.5"
                          : "text-[#F5F2D8]/30 hover:text-[#F5F2D8]/50 group-hover:gap-2.5"
                      }`}
                    >
                      {product.status === "active" ? "Try Now" : "Learn more"}
                      <span aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
