import { BrainCircuit, BarChart3, Briefcase } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
const features = [
  {
    Icon: BrainCircuit,
    title: "AI Scoring",
    description:
      "Get a multi-dimensional score across clarity, impact, completeness, and ATS compatibility.",
  },
  {
    Icon: BarChart3,
    title: "Skill Gap Analysis",
    description:
      "Identify the exact skills missing for your target role and close the gap with targeted suggestions.",
  },
  {
    Icon: Briefcase,
    title: "Job Match Comparison",
    description:
      "Paste any job description to see your match percentage and the qualifications you need to highlight.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      className="bg-muted/30 py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          id="features-heading"
          className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-center mb-4"
        >
          Why pathkr?
        </h2>
        <p className="text-base text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          AI-powered analysis across 4 dimensions — clarity, impact, ATS compatibility, and keyword
          relevance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ Icon, title, description }) => (
              <Card
                key={title}
                className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
      </div>
    </section>
  );
}
