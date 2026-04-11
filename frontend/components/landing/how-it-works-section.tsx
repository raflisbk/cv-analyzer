import { ChevronRight } from "lucide-react";
import { AccentPill } from "@/components/ui/accent-pill";

const steps = [
  {
    pillColor: "lime" as const,
    number: "1",
    title: "Upload",
    description: "Drag and drop your CV or click to browse. Supports PDF and DOCX.",
  },
  {
    pillColor: "pink" as const,
    number: "2",
    title: "Analyze",
    description: "AI scores your CV across clarity, impact, ATS formatting, and keyword relevance.",
  },
  {
    pillColor: "orange" as const,
    number: "3",
    title: "Compare",
    description: "Paste any job description to get your match score and a ranked skill gap list.",
  },
  {
    pillColor: "purple" as const,
    number: "4",
    title: "Export",
    description: "Download a professional PDF report with all scores, suggestions, and action items.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="hiws-heading"
      className="bg-[#F5F2D8] py-16 md:py-24 border-t border-[#141414]/10"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          id="hiws-heading"
          className="font-display font-extrabold text-2xl md:text-3xl text-[#141414] text-center mb-12"
        >
          How It Works
        </h2>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-8 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-start md:items-center md:contents">
              {/* Step item */}
              <div className="flex-1 text-center px-4">
                <div className="flex justify-center mb-0">
                  <AccentPill color={step.pillColor} size="md">{step.number}</AccentPill>
                </div>
                <p className="text-base font-extrabold text-[#141414] mt-4 mb-2">
                  {step.title}
                </p>
                <p className="text-sm text-[#141414]/60 max-w-[160px] mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Connector between steps — desktop only, not after last step */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center pt-5 flex-shrink-0 px-2">
                  <ChevronRight className="w-5 h-5 text-[#141414]/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
