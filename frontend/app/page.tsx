import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import ProductsSection from "@/components/landing/products-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import StatsSection from "@/components/landing/stats-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
      </main>
    </>
  );
}
