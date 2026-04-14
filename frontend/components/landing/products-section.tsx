import Link from "next/link";
import { CVBuilderIcon, CVAnalyzerIcon, JobFindingIcon } from "@/components/ui/product-icons";
import { AccentPill } from "@/components/ui/accent-pill";
import { PathkrInline } from "@/components/ui/pathkr-logo";

const products = [
  {
    id: "cv-builder",
    Icon: CVBuilderIcon,
    iconContainer: "bg-[#FF8C42]/15 rounded-full p-4",
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
    iconContainer: "bg-[#CAFF43]/15 rounded-full p-4",
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
    iconContainer: "bg-[#8B5CF6]/15 rounded-full p-4",
    iconColor: "text-[#8B5CF6]",
    title: "Job Finding",
    description:
      "Discover roles that match your skills and experience with intelligent job recommendations.",
    status: "coming-soon" as const,
    href: "/job-finding",
  },
];

export default function ProductsSection() {
  return (
    <section 
      className="py-20 md:py-32"
      style={{
        background: "linear-gradient(180deg, #1A170F 0%, #16130C 100%)",
        borderTop: "1px solid rgba(255,255,255,0.04)"
      }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <h2 className="mb-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F2D8]">
            What <PathkrInline variant="dark" /> Offers
          </h2>
          <p className="text-base md:text-lg font-medium tracking-wide text-[#F5F2D8]/50">
            Three tools. One career platform.
          </p>
        </div>

        {/* Product card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                {/* Subtle top gradient glow on hover */}
                <div 
                  className="absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse at top, ${product.iconColor === 'text-[#CAFF43]' ? 'rgba(202,255,67,0.1)' : product.iconColor === 'text-[#FF8C42]' ? 'rgba(255,140,66,0.1)' : 'rgba(139,92,246,0.1)'} 0%, transparent 70%)`
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  {/* Header: Icon + Status */}
                  <div className="flex items-start justify-between mb-8">
                    {/* Icon container */}
                    <div 
                      className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${product.iconContainer.split(' ')[0]}`}
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <product.Icon size={28} className={product.iconColor} />
                    </div>

                    {/* Status badge */}
                    <div>
                      {product.status === "active" ? (
                        <AccentPill color="lime" size="sm">Active</AccentPill>
                      ) : (
                        <span className="rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase"
                              style={{ background: "rgba(245,242,216,0.06)", color: "rgba(245,242,216,0.4)" }}>
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-[#F5F2D8]">
                    {product.title}
                  </h3>
                  
                  <p className="mb-8 min-h-[60px] text-[15px] leading-relaxed text-[#F5F2D8]/60">
                    {product.description}
                  </p>

                  {/* CTA */}
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
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
