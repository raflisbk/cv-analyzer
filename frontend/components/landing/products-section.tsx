"use client";

import { useEffect, useRef } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";
import Link from "next/link";
import {
  CVBuilderIcon,
  CVAnalyzerIcon,
  JobFindingIcon,
} from "@/components/ui/product-icons";
import { PathkrInline } from "@/components/ui/pathkr-logo";

const products = [
  {
    id: "cv-builder",
    Icon: CVBuilderIcon,
    accent: "#FF8C42",
    iconColor: "text-[#FF8C42]",
    title: "CV Builder",
    description:
      "Create a professional CV from scratch with AI guidance and industry-standard templates.",
    status: "coming-soon" as const,
    href: "/cv-builder",
  },
  {
    id: "cv-analyzer",
    Icon: CVAnalyzerIcon,
    accent: "#CAFF43",
    iconColor: "text-[#CAFF43]",
    title: "CV Analyzer",
    description:
      "Upload your CV for AI-powered scoring across clarity, impact, ATS compatibility, and keyword relevance.",
    status: "active" as const,
    href: "/cv-analyzer",
  },
  {
    id: "job-finding",
    Icon: JobFindingIcon,
    accent: "#8B5CF6",
    iconColor: "text-[#8B5CF6]",
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
          },
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
          },
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
      id="products"
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
            <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between border-y border-dashed border-[#F5F2D8]/20 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5F2D8]/40">
              <span>BOARDING PASS</span>
              <span>Route: CV / Career</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="product-card group relative overflow-hidden border-y border-dashed border-[#F5F2D8]/20 px-5 py-5 transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  borderTopColor: product.accent,
                }}
              >
                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5F2D8]/40">
                    <span>BOARDING PASS</span>
                    <span>{String(index + 1).padStart(2, "0")} / 03</span>
                  </div>

                  <div className="mb-5 flex items-start justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center border border-dashed border-[#F5F2D8]/25">
                      <product.Icon size={28} className={product.iconColor} />
                    </div>

                    <div>
                      {product.status === "active" ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#CAFF43]">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#F5F2D8]/40">
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
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6h8m0 0L7 3m3 3L7 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
