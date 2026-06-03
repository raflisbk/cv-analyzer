import { AIScoringIcon, SkillGapIcon, JobMatchIcon } from "@/components/ui/feature-icons";

const features = [
  {
    Icon: AIScoringIcon,
    iconBg: "bg-[#CAFF43]/20",
    iconColor: "text-[#141414]",
    title: "AI Scoring",
    description:
      "Get a multi-dimensional score across clarity, impact, completeness, and ATS compatibility.",
  },
  {
    Icon: SkillGapIcon,
    iconBg: "bg-[#FF4FCB]/20",
    iconColor: "text-[#141414]",
    title: "Skill Gap Analysis",
    description:
      "Identify the exact skills missing for your target role and close the gap with targeted suggestions.",
  },
  {
    Icon: JobMatchIcon,
    iconBg: "bg-[#FF8C42]/20",
    iconColor: "text-[#141414]",
    title: "Job Match Comparison",
    description:
      "Paste any job description to see your match percentage and the qualifications you need to highlight.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      className="bg-[#F5F2D8] py-20 md:py-32"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="mb-16 text-center">
          <h2
            id="features-heading"
            className="mb-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-[#141414]"
          >
            What CV Analyzer can do
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg font-medium tracking-wide text-[#141414]/60">
            AI-powered analysis across 4 dimensions — clarity, impact, ATS compatibility,
            and keyword relevance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map(({ Icon, iconBg, iconColor, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1.5"
              style={{
                background: "#FFFDF4",
                boxShadow: "0 8px 32px rgba(17,17,17,0.06), 0 1px 2px rgba(17,17,17,0.04)",
                border: "1px solid rgba(17,17,17,0.07)",
              }}
            >
              <div
                className={`mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
              >
                <Icon size={28} className={iconColor} />
              </div>
              
              <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-[#141414]">
                {title}
              </h3>
              
              <p className="text-[15px] leading-relaxed text-[#141414]/60">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
