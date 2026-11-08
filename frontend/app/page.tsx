import { Suspense } from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/landing/hero/hero-section";
import IntroLoader from "@/components/landing/intro/intro-loader";
import RagExplainerSection from "@/components/landing/rag-explainer-section";
import ProductsSection from "@/components/landing/products-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import StatsSection from "@/components/landing/stats-section";
import SeeItInActionSection from "@/components/landing/see-it-in-action-section";
import FloatingFooter from "@/components/landing/floating-footer";
import SectionDots from "@/components/landing/section-dots";
import Footer from "@/components/landing/footer";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";

export const metadata: Metadata = {
  icons: { icon: "/landing/logo/pathkr-icon.svg" },
};

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginRequiredDialog />
      </Suspense>
      <IntroLoader />
      <main>
        <HeroSection />
        <RagExplainerSection />
        <ProductsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <SeeItInActionSection />
      </main>
      <Footer />
      <FloatingFooter />
      {/* Scroll-spy dot navigation (cloudstudio-style section pager) */}
      <SectionDots />
    </>
  );
}
