import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/landing/navbar";
import { AccentPill } from "@/components/ui/accent-pill";
import { AIScoringIcon, SkillGapIcon, JobMatchIcon } from "@/components/ui/feature-icons";
import UploadZoneCTA from "@/components/cv-analyzer/upload-zone-cta";

export const metadata: Metadata = {
  title: "CV Analyzer — Path Karir",
  description:
    "AI-powered CV scoring across clarity, impact, ATS compatibility, and keyword relevance. Free and instant.",
};

const features = [
  {
    Icon: AIScoringIcon,
    iconContainer: "bg-[#CAFF43]/20 rounded-full p-3",
    iconColor: "text-[#141414]",
    color: "lime" as const,
    title: "AI Scoring",
    description:
      "Multi-dimensional score across clarity, impact, completeness, and ATS compatibility.",
  },
  {
    Icon: SkillGapIcon,
    iconContainer: "bg-[#FF4FCB]/20 rounded-full p-3",
    iconColor: "text-[#FF4FCB]",
    color: "pink" as const,
    title: "Skill Gap Analysis",
    description:
      "Identify exact skills missing for your target role with targeted improvement suggestions.",
  },
  {
    Icon: JobMatchIcon,
    iconContainer: "bg-[#FF8C42]/20 rounded-full p-3",
    iconColor: "text-[#FF8C42]",
    color: "orange" as const,
    title: "Job Match Comparison",
    description:
      "Paste any job description to see your match percentage and highlight key qualifications.",
  },
];

const steps = [
  { color: "lime" as const, number: "1", title: "Upload", description: "Drag & drop your CV. Supports PDF and DOCX." },
  { color: "pink" as const, number: "2", title: "Analyze", description: "AI scores across clarity, impact, ATS formatting, and keywords." },
  { color: "orange" as const, number: "3", title: "Compare", description: "Paste a job description to get your match score and skill gap list." },
  { color: "purple" as const, number: "4", title: "Export", description: "Download a PDF report with all scores, suggestions, and action items." },
];

export default function CVAnalyzerPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="bg-[#F5F2D8] px-4 md:px-8 py-6 md:py-8">
          <div className="bg-[#141414] rounded-[2rem] max-w-6xl mx-auto px-8 md:px-16 py-16 md:py-24 overflow-hidden relative">

            {/* Decorative circles */}
            <div className="absolute top-8 right-12 w-5 h-5 rounded-full bg-[#CAFF43] opacity-80" aria-hidden="true" />
            <div className="absolute top-16 right-24 w-3 h-3 rounded-full bg-[#FF4FCB] opacity-60" aria-hidden="true" />
            <div className="absolute top-6 right-40 w-8 h-8 rounded-full bg-[#FF8C42] opacity-40" aria-hidden="true" />
            <div className="absolute bottom-10 left-8 w-4 h-4 rounded-full bg-[#8B5CF6] opacity-50" aria-hidden="true" />

            {/* Headline */}
            <h1 className="font-display font-extrabold text-[#F5F2D8] leading-[1.1] text-5xl md:text-6xl lg:text-7xl tracking-tight">
              Your CV{" "}
              <AccentPill color="lime" size="hero">deserves</AccentPill>
              <br />
              <AccentPill color="pink" size="hero">better</AccentPill>
              {" "}results
            </h1>

            {/* Sub-headline */}
            <p className="font-sans text-base md:text-lg text-[#F5F2D8]/70 mt-6 max-w-lg leading-relaxed">
              AI-powered CV scoring. Skill gap detection. Job match comparison.
              Get actionable feedback instantly.
            </p>
            <p className="font-sans text-sm text-[#F5F2D8]/50 mt-2">Free · Instant · No sign-up required</p>

            {/* Upload CTA — client component */}
            <div className="mt-10">
              <UploadZoneCTA />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section aria-labelledby="cva-features-heading" className="bg-[#F5F2D8] py-16 md:py-24 border-t border-[#141414]/10">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2
              id="cva-features-heading"
              className="font-display font-extrabold text-2xl md:text-3xl text-[#141414] text-center mb-4"
            >
              What CV Analyzer can do
            </h2>
            <p className="text-base text-[#141414]/60 text-center mb-12 max-w-2xl mx-auto">
              Four scoring dimensions powered by AI — get a complete picture of
              your CV&apos;s strengths and gaps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map(({ Icon, iconContainer, iconColor, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-6 border-0 shadow-sm
                             transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`inline-flex ${iconContainer}`}>
                    <Icon size={24} className={iconColor} />
                  </div>
                  <p className="text-base font-extrabold text-[#141414] mt-3 mb-2">{title}</p>
                  <p className="text-sm text-[#141414]/60 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section aria-labelledby="cva-hiw-heading" className="bg-[#141414] py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2
              id="cva-hiw-heading"
              className="font-display font-extrabold text-2xl md:text-3xl text-[#F5F2D8] text-center mb-12"
            >
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-8 md:gap-0">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-start md:items-center md:contents">
                  <div className="flex-1 text-center px-4">
                    <div className="flex justify-center">
                      <AccentPill color={step.color} size="md">{step.number}</AccentPill>
                    </div>
                    <p className="text-base font-extrabold text-[#F5F2D8] mt-4 mb-2">{step.title}</p>
                    <p className="text-sm text-[#F5F2D8]/60 max-w-[160px] mx-auto">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center pt-5 flex-shrink-0 px-2">
                      <ChevronRight className="w-5 h-5 text-[#F5F2D8]/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Back to Path Karir ── */}
        <section className="bg-[#F5F2D8] py-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-display font-extrabold
                       text-[#141414]/50 hover:text-[#141414] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Path Karir
          </Link>
        </section>
      </main>
    </>
  );
}
