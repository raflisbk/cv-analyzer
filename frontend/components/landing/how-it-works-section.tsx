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
      className="relative bg-[#F5F2D8] py-20 md:py-32"
    >
      {/* Premium subtle gradient top divider */}
      <div 
        className="absolute inset-x-0 top-0 h-[1px]" 
        style={{
          background: "linear-gradient(90deg, transparent, rgba(20,20,20,0.06), transparent)"
        }}
        aria-hidden="true" 
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          id="hiws-heading"
          className="mb-16 text-center font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#141414]"
        >
          How It Works
        </h2>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-12 md:gap-0 relative">
          {/* Faint connecting line for desktop */}
          <div 
            className="hidden md:block absolute top-[1.25rem] left-[10%] right-[10%] h-[2px] -z-10"
            style={{ 
              background: "linear-gradient(90deg, transparent, rgba(20,20,20,0.05) 10%, rgba(20,20,20,0.05) 90%, transparent)" 
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <div key={step.number} className="group flex items-start md:items-center md:contents">
              {/* Step item */}
              <div className="flex-1 text-center px-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-center mb-6">
                  <span className="inline-block transition-transform duration-300 group-hover:scale-110">
                    <AccentPill color={step.pillColor} size="md">Step {step.number}</AccentPill>
                  </span>
                </div>
                <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-[#141414]">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-[200px] text-[15px] leading-relaxed text-[#141414]/60">
                  {step.description}
                </p>
              </div>

              {/* Connector between steps — desktop only, not after last step */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center -mt-16 flex-shrink-0 px-2 transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5 text-[#141414]/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
