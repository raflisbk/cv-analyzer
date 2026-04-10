import { ChevronRight } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="hiws-heading"
      className="bg-background py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          id="hiws-heading"
          className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-center mb-12"
        >
          How It Works
        </h2>

        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-0">
            {/* Step 1 */}
            <div className="flex-1 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary text-primary font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <p className="text-base font-semibold text-foreground mb-2">
                Upload
              </p>
              <p className="text-sm text-muted-foreground max-w-[160px] mx-auto">
                Drag and drop your CV or click to browse. Supports PDF and
                DOCX.
              </p>
            </div>

            {/* Connector 1 */}
            <div className="hidden md:flex items-center justify-center pt-6 flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Step 2 */}
            <div className="flex-1 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary text-primary font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <p className="text-base font-semibold text-foreground mb-2">
                Analyze
              </p>
              <p className="text-sm text-muted-foreground max-w-[160px] mx-auto">
                AI scores your CV across clarity, impact, ATS formatting, and
                keyword relevance.
              </p>
            </div>

            {/* Connector 2 */}
            <div className="hidden md:flex items-center justify-center pt-6 flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Step 3 */}
            <div className="flex-1 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary text-primary font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <p className="text-base font-semibold text-foreground mb-2">
                Compare
              </p>
              <p className="text-sm text-muted-foreground max-w-[160px] mx-auto">
                Paste any job description to get your match score and a ranked
                skill gap list.
              </p>
            </div>

            {/* Connector 3 */}
            <div className="hidden md:flex items-center justify-center pt-6 flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Step 4 */}
            <div className="flex-1 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary text-primary font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <p className="text-base font-semibold text-foreground mb-2">
                Export
              </p>
              <p className="text-sm text-muted-foreground max-w-[160px] mx-auto">
                Download a professional PDF report with all scores, suggestions,
                and action items.
              </p>
            </div>
          </div>
      </div>
    </section>
  );
}
