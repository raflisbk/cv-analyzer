import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import ProductsSection from "@/components/landing/products-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import StatsSection from "@/components/landing/stats-section";
import Footer from "@/components/landing/footer";
import ScrollReveal from "@/components/landing/scroll-reveal";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollReveal delay={0}>
          <HeroSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <ProductsSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <FeaturesSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <HowItWorksSection />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <StatsSection />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
