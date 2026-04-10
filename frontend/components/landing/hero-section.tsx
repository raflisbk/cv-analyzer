"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadModal } from "@/components/providers/upload-modal-provider";

export default function HeroSection() {
  const { openModal } = useUploadModal();

  return (
    <section
      className="bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]
                 flex flex-col items-center text-center px-4 py-24 md:py-32"
    >
      {/* Headline — max-w-3xl keeps long text from spanning too wide */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Your Career, On the{" "}
          <span className="text-primary">Right Path</span>
        </h1>
      </div>

      {/* Sub-headline */}
      <p className="mt-6 text-base text-muted-foreground max-w-xl mx-auto">
        AI-powered CV analysis, skill gap detection, and job matching — all in
        one place.
      </p>

      {/* CTA */}
      <Button
        size="lg"
        className="mt-8 rounded-full"
        onClick={openModal}
      >
        Start Analyzing
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </section>
  );
}
