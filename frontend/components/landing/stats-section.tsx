const stats = [
  { number: "10,000+", label: "CVs Analyzed", isLime: false },
  { number: "4",       label: "Scoring Dimensions", isLime: true },
  { number: "Free",    label: "To Use", isLime: false },
  { number: "Instant", label: "Results", isLime: false },
];

export default function StatsSection() {
  return (
    <section className="bg-[#141414] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {/* Stat item */}
              <div className="text-center px-8">
                <p className={`font-display font-extrabold text-2xl md:text-3xl leading-none ${stat.isLime ? "text-[#CAFF43]" : "text-[#F5F2D8]"}`}>
                  {stat.number}
                </p>
                <p className="text-sm font-normal text-[#F5F2D8]/50 mt-1">
                  {stat.label}
                </p>
              </div>
              {/* Vertical divider between items — desktop only, not after last item */}
              {i < stats.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-[#F5F2D8]/10 mx-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
