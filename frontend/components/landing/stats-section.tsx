const stats = [
  { number: "10,000+", label: "CVs Analyzed", isLime: false },
  { number: "4",       label: "Scoring Dimensions", isLime: true },
  { number: "Free",    label: "To Use", isLime: false },
  { number: "Instant", label: "Results", isLime: false },
];

export default function StatsSection() {
  return (
    <section 
      className="py-16 md:py-24"
      style={{
        background: "linear-gradient(180deg, #1A170F 0%, #16130C 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="group flex items-center">
              <div className="text-center px-8 transition-transform duration-300 group-hover:-translate-y-1">
                <p 
                  className={`font-display font-extrabold text-4xl md:text-5xl leading-none tracking-tight mb-2 ${
                    stat.isLime ? "text-[#CAFF43]" : "text-[#F5F2D8]"
                  }`}
                  style={stat.isLime ? {
                    textShadow: "0 0 20px rgba(202,255,67,0.2)"
                  } : undefined}
                >
                  {stat.number}
                </p>
                <p className="text-[15px] font-medium tracking-wide text-[#F5F2D8]/50 uppercase">
                  {stat.label}
                </p>
              </div>
              
              {i < stats.length - 1 && (
                <div 
                  className="hidden md:block w-px h-16 mx-0 bg-gradient-to-b from-transparent via-[#F5F2D8]/10 to-transparent" 
                  aria-hidden="true" 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
