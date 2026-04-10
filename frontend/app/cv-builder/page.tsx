import type { Metadata } from "next";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "CV Builder — pathkr",
  description: "Build standout CVs with AI guidance.",
};

export default function CVBuilderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
        {/* Product icon */}
        <div className="rounded-2xl bg-primary/10 p-4 text-primary mb-6">
          <FileText className="h-12 w-12" />
        </div>

        {/* Status badge */}
        <Badge variant="secondary" className="mb-4">
          Coming Soon
        </Badge>

        {/* Heading + tagline */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
          CV Builder
        </h1>
        <p className="text-base text-muted-foreground max-w-sm mb-8">
          Build standout CVs with AI guidance.
        </p>

        {/* Email capture — static, no backend (per CONTEXT.md deferred: Notify Me email backend) */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <input
            type="email"
            placeholder="Enter your email for early access"
            aria-label="Email address for early access notification"
            className="w-full px-4 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="outline" className="w-full">
            Notify Me
          </Button>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to pathkr
        </Link>
      </main>
    </>
  );
}
