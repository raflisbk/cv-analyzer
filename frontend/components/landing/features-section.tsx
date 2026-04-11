import { AIScoringIcon, SkillGapIcon, JobMatchIcon } from "@/components/ui/feature-icons";

const features = [
  {
    Icon: AIScoringIcon,
    iconContainer: "bg-[#CAFF43]/20 rounded-full p-3",
    iconColor: "text-[#141414]",
    title: "AI Scoring",
    description:
      "Get a multi-dimensional score across clarity, impact, completeness, and ATS compatibility.",
  },
  {
    Icon: SkillGapIcon,
    iconContainer: "bg-[#FF4FCB]/20 rounded-full p-3",
    iconColor: "text-[#141414]",
    title: "Skill Gap Analysis",
    description:
      "Identify the exact skills missing for your target role and close the gap with targeted suggestions.",
  },
  {
    Icon: JobMatchIcon,
    iconContainer: "bg-[#FF8C42]/20 rounded-full p-3",
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
      className="bg-[#F5F2D8] py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          id="features-heading"
          className="font-display font-extrabold text-2xl md:text-3xl text-[#141414] text-center mb-4"
        >
          Why pathkr?
        </h2>
        <p className="text-base text-[#141414]/60 text-center mb-12 max-w-2xl mx-auto">
          AI-powered analysis across 4 dimensions — clarity, impact, ATS compatibility, and keyword
          relevance.
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
  );
}
