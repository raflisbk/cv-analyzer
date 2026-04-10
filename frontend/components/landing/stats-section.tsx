const stats = [
  { number: "10,000+", label: "CVs Analyzed" },
  { number: "4",       label: "Scoring Dimensions" },
  { number: "Free",    label: "To Use" },
  { number: "Instant", label: "Results" },
];

export default function StatsSection() {
  return (
    <section className="bg-background py-12 md:py-16 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8 md:gap-16">
              {/* Stat item */}
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {stat.number}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
              {/* Vertical divider between items — desktop only, not after last item */}
              {i < stats.length - 1 && (
                <div className="hidden md:block w-px h-8 bg-border" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
