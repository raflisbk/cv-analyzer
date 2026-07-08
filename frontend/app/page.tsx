import { Suspense } from "react";
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import ProductsSection from "@/components/landing/products-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import StatsSection from "@/components/landing/stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import SeeItInActionSection from "@/components/landing/see-it-in-action-section";
import FloatingFooter from "@/components/landing/floating-footer";
import Footer from "@/components/landing/footer";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRequiredDialog />
      </Suspense>
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <SeeItInActionSection />
      </main>
      <Footer />
      <FloatingFooter />
    </>
  );
}
