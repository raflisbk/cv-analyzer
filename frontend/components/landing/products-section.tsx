import Link from "next/link";
import { CVBuilderIcon, CVAnalyzerIcon, JobFindingIcon } from "@/components/ui/product-icons";
import { AccentPill } from "@/components/ui/accent-pill";
import ProductCardCTA from "@/components/landing/product-card-cta";

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
    href: null,
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
    <section className="bg-[#141414] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-[#F5F2D8] mb-4">
            What pathkr Offers
          </h2>
          <p className="text-base text-[#F5F2D8]/60">
            Three tools. One career platform.
          </p>
        </div>

        {/* Product card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-[#1C1C1C] rounded-2xl p-6 border border-[#F5F2D8]/5
                           transition-transform duration-200 hover:-translate-y-1"
              >
                {/* Icon container */}
                <div className={`inline-flex ${product.iconContainer}`}>
                  <product.Icon className={`h-7 w-7 ${product.iconColor}`} />
                </div>

                {/* Status badge */}
                <div className="mt-3 mb-2">
                  {product.status === "active" ? (
                    <AccentPill color="lime" size="md">Active</AccentPill>
                  ) : (
                    <span className="rounded-full px-4 py-1 text-sm bg-[#F5F2D8]/10 text-[#F5F2D8]/50">
                      Coming Soon
                    </span>
                  )}
                </div>

                <p className="text-base font-extrabold text-[#F5F2D8] mt-3 mb-2">
                  {product.title}
                </p>
                <p className="text-sm text-[#F5F2D8]/60 leading-relaxed">
                  {product.description}
                </p>

                {/* CTA */}
                <div className="mt-4">
                  {product.status === "active" ? (
                    <ProductCardCTA />
                  ) : (
                    <Link
                      href={product.href!}
                      className="text-sm text-[#F5F2D8]/40 hover:text-[#F5F2D8]/70 transition-colors"
                    >
                      Learn more →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
