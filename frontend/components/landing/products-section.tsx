import { FileText, BarChart2, Search } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCardCTA from "@/components/landing/product-card-cta";

const products = [
  {
    id: "cv-builder",
    icon: FileText,
    title: "CV Builder",
    description:
      "Create a professional CV from scratch with AI guidance and industry-standard templates.",
    status: "coming-soon" as const,
    href: "/cv-builder",
  },
  {
    id: "cv-analyzer",
    icon: BarChart2,
    title: "CV Analyzer",
    description:
      "Upload your CV for AI-powered scoring across clarity, impact, ATS compatibility, and keyword relevance.",
    status: "active" as const,
    href: null,
  },
  {
    id: "job-finding",
    icon: Search,
    title: "Job Finding",
    description:
      "Discover roles that match your skills and experience with intelligent job recommendations.",
    status: "coming-soon" as const,
    href: "/job-finding",
  },
];

export default function ProductsSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
            What pathkr Offers
          </h2>
          <p className="text-base text-muted-foreground">
            Three tools. One career platform.
          </p>
        </div>

        {/* Product card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.id}
                className="relative overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader>
                  {/* Icon container — same pattern as FeaturesSection */}
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Status badge */}
                  {product.status === "active" ? (
                    <Badge
                      variant="outline"
                      className="w-fit text-primary border-primary/30 bg-primary/10 mb-2"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="w-fit text-muted-foreground mb-2"
                    >
                      Coming Soon
                    </Badge>
                  )}

                  <CardTitle className="text-xl font-bold text-foreground">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* CTA: Active card uses client island; Coming Soon cards use Link */}
                  {product.status === "active" ? (
                    <ProductCardCTA />
                  ) : (
                    <Link
                      href={product.href!}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Learn more →
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
